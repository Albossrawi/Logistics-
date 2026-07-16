import { useRef, useState } from 'react';
import {
  Camera, ScanLine, Plus, Trash2, FileSpreadsheet, FileText,
  Printer, Mail, RotateCw, Loader2, X, ChevronDown, ChevronUp, Check,
  Sparkles, Settings2, Eye, EyeOff, Zap,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useLabelStore } from '../store/labelStore';
import { useSettingsStore, AI_MODELS } from '../store/settingsStore';
import { fileToDataURL, rotateImage, scanLabel } from '../utils/ocr';
import { scanLabelAI, testAiKey, describeAiError } from '../utils/aiVision';
import { exportExcel, exportWord, printBatch, emailBatch, formatLine } from '../utils/labelExport';
import { groupByDelivery, flatRows, isDuplicatePackage } from '../utils/grouping';
import type { DeliveryGroup } from '../utils/grouping';
import { validateDelivery, validateReference, deliveryExample, referenceExample } from '../utils/validation';
import type { LabelEntry } from '../types';

interface Draft {
  photo?: string;
  deliveryNumber: string;
  referenceNumber: string;
  sscc: string;
  quantity: string;
  rawText: string;
}

const emptyDraft: Draft = { deliveryNumber: '', referenceNumber: '', sscc: '', quantity: '', rawText: '' };

export function LabelExtractor() {
  const {
    batches, activeBatchId, activeBatch, createBatch, selectBatch, deleteBatch,
    updateBatch, addEntry, updateEntry, deleteEntry,
  } = useLabelStore();

  const { engine, apiKey, model, rapidCapture, autoCll, format, setEngine, setApiKey, setModel, setRapidCapture, setAutoCll, setFormat, resetFormat } = useSettingsStore();

  const batch = activeBatch();
  const fileRef = useRef<HTMLInputElement>(null);

  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [manualMode, setManualMode] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showRaw, setShowRaw] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [engineNote, setEngineNote] = useState('');
  const [rapidCount, setRapidCount] = useState(0);
  const [rapidLast, setRapidLast] = useState('');
  const [aiTest, setAiTest] = useState<{ status: 'idle' | 'testing' | 'ok' | 'error'; msg?: string }>({ status: 'idle' });

  const aiActive = engine === 'ai' && apiKey.trim() !== '';

  if (!batch) return null;

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const photo = await fileToDataURL(file);
    setShowRaw(false);
    if (rapidCapture) {
      void rapidScanAndAdd(photo);
    } else {
      setDraft({ ...emptyDraft, photo });
      void runScan(photo);
    }
  }

  /** Read a photo with the active engine (AI with OCR fallback, or OCR). */
  async function performScan(photo: string): Promise<{ delivery: string; reference: string; sscc: string; rawText: string; note: string }> {
    const prefixes = { deliveryPrefix: format.deliveryPrefix, referencePrefix: format.referencePrefix };
    if (aiActive) {
      try {
        const r = await scanLabelAI(photo, { apiKey: apiKey.trim(), model, ...prefixes });
        return { delivery: r.deliveryNumber, reference: r.referenceNumber, sscc: r.sscc, rawText: r.rawText, note: 'Read with AI (Claude vision)' };
      } catch (err) {
        console.error('AI vision failed, falling back to on-device OCR', err);
        const r = await scanLabel(photo, setProgress, prefixes);
        return { delivery: r.deliveryNumber, reference: r.referenceNumber, sscc: r.sscc, rawText: r.rawText, note: `AI read failed: ${describeAiError(err)} Used on-device OCR.` };
      }
    }
    const r = await scanLabel(photo, setProgress, prefixes);
    return { delivery: r.deliveryNumber, reference: r.referenceNumber, sscc: r.sscc, rawText: r.rawText, note: '' };
  }

  async function runScan(photo: string) {
    setScanning(true);
    setProgress(0);
    setEngineNote('');
    try {
      const { delivery, reference, sscc, rawText, note } = await performScan(photo);
      setEngineNote(note);
      setDraft((d) => ({ ...d, photo, deliveryNumber: delivery, referenceNumber: reference, sscc, rawText }));
    } catch (err) {
      console.error('Scan failed', err);
      setDraft((d) => ({ ...d, rawText: 'Could not read the image. Enter the numbers by hand.' }));
    } finally {
      setScanning(false);
    }
  }

  /** Rapid mode: scan, auto-add the row, then reopen the camera for the next shot. */
  async function rapidScanAndAdd(photo: string) {
    setScanning(true);
    setProgress(0);
    setEngineNote('');
    try {
      const { delivery, reference, sscc, rawText, note } = await performScan(photo);
      setEngineNote(note);
      // Only auto-add when both numbers pass the format check. Otherwise pause on
      // the review card with the errors so they can be corrected by hand.
      const valid = !validateDelivery(delivery, format) && !validateReference(reference, format);
      if (valid) {
        // In auto-CLL mode, skip a box already counted (same delivery + SSCC).
        if (autoCll && isDuplicatePackage(batch!.entries, delivery, sscc)) {
          setRapidLast(`${delivery.trim()} · already counted`);
          window.setTimeout(() => fileRef.current?.click(), 400);
        } else {
          addEntry(batch!.id, {
            deliveryNumber: delivery.trim(),
            referenceNumber: reference.trim(),
            sscc: sscc.trim(),
            quantity: '',
            photo,
          });
          setRapidCount((c) => c + 1);
          setRapidLast(delivery.trim() || reference.trim());
          // Best-effort auto-reopen (works on desktop; phones need the tap below).
          window.setTimeout(() => fileRef.current?.click(), 400);
        }
      } else {
        // Failed the format check — pause so it can be checked/typed by hand.
        // The per-field errors are shown live on the review card below.
        setDraft({
          ...emptyDraft,
          photo,
          deliveryNumber: delivery,
          referenceNumber: reference,
          sscc,
          rawText,
        });
      }
    } catch (err) {
      console.error('Rapid scan failed', err);
      setDraft({ ...emptyDraft, photo, rawText: 'Could not read the image. Enter the numbers by hand.' });
    } finally {
      setScanning(false);
    }
  }

  async function rotateDraft() {
    if (!draft.photo) return;
    const rotated = await rotateImage(draft.photo, 90);
    setDraft((d) => ({ ...d, photo: rotated }));
  }

  function commitDraft(force = false) {
    if (!force && (validateDelivery(draft.deliveryNumber, format) || validateReference(draft.referenceNumber, format))) return;
    if (autoCll && isDuplicatePackage(batch!.entries, draft.deliveryNumber, draft.sscc)) {
      alert('That package (same delivery + serial number) is already counted.');
      return;
    }
    addEntry(batch!.id, {
      deliveryNumber: draft.deliveryNumber.trim(),
      referenceNumber: draft.referenceNumber.trim(),
      sscc: draft.sscc.trim(),
      quantity: draft.quantity.trim(),
      photo: draft.photo,
    });
    setDraft(emptyDraft);
    setManualMode(false);
    setShowRaw(false);
  }

  async function runAiTest() {
    setAiTest({ status: 'testing' });
    try {
      await testAiKey({ apiKey: apiKey.trim(), model });
      setAiTest({ status: 'ok' });
    } catch (err) {
      setAiTest({ status: 'error', msg: describeAiError(err) });
    }
  }

  async function withBusy(key: string, fn: () => Promise<void> | void) {
    setBusy(key);
    try {
      await fn();
    } catch (err) {
      console.error(err);
      alert('Something went wrong generating the file.');
    } finally {
      setBusy(null);
    }
  }

  const draftDeliveryError = validateDelivery(draft.deliveryNumber, format);
  const draftReferenceError = validateReference(draft.referenceNumber, format);
  const draftValid = !draftDeliveryError && !draftReferenceError;

  // Rows for display/export: grouped-by-delivery (auto CLL) or one per scan.
  const groups = groupByDelivery(batch.entries);
  const outputRows = autoCll ? groups : flatRows(batch.entries);

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-16">
      {/* Intro + reader settings */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-surface-400 text-sm">
          Photograph a label, capture the reference &amp; delivery numbers, and export a printable sheet.
        </p>
        <button
          onClick={() => setShowSettings((s) => !s)}
          className={clsx(
            'flex items-center gap-1.5 text-sm rounded-lg px-3 py-2 border transition-colors flex-shrink-0',
            aiActive
              ? 'bg-violet-600/20 border-violet-500/40 text-violet-300'
              : 'bg-surface-800 border-surface-700 text-surface-300 hover:text-white'
          )}
          title="Reader settings"
        >
          <Settings2 size={15} />
          {aiActive ? 'Smart read: on' : 'Reader'}
        </button>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-4 space-y-4">
          <div>
            <div className="text-xs font-semibold text-surface-300 uppercase tracking-wide mb-2">
              How to read labels
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                onClick={() => setEngine('ocr')}
                className={clsx(
                  'text-left rounded-lg border p-3 transition-colors',
                  engine === 'ocr'
                    ? 'border-primary-500 bg-primary-600/10'
                    : 'border-surface-700 hover:border-surface-600'
                )}
              >
                <div className="flex items-center gap-2 text-white text-sm font-medium">
                  <ScanLine size={15} /> On-device OCR
                </div>
                <div className="text-xs text-surface-400 mt-1">
                  Free, no key, works offline — nothing leaves your device. Less accurate on tricky labels.
                </div>
              </button>
              <button
                onClick={() => setEngine('ai')}
                className={clsx(
                  'text-left rounded-lg border p-3 transition-colors',
                  engine === 'ai'
                    ? 'border-violet-500 bg-violet-600/10'
                    : 'border-surface-700 hover:border-surface-600'
                )}
              >
                <div className="flex items-center gap-2 text-white text-sm font-medium">
                  <Sparkles size={15} className="text-violet-300" /> Smart read (AI)
                </div>
                <div className="text-xs text-surface-400 mt-1">
                  Claude vision — best on messy photos. Needs an API key; uses your account.
                </div>
              </button>
            </div>
          </div>

          {/* Auto CLL counting */}
          <div className="border-t border-surface-800 pt-3">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm text-white">
                <Check size={15} className={autoCll ? 'text-emerald-400' : 'text-surface-400'} />
                Count CLL from packages
              </span>
              <button
                role="switch"
                aria-checked={autoCll}
                onClick={() => setAutoCll(!autoCll)}
                className={clsx('relative w-11 h-6 rounded-full transition-colors flex-shrink-0', autoCll ? 'bg-emerald-500' : 'bg-surface-700')}
              >
                <span className={clsx('absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform', autoCll && 'translate-x-5')} />
              </button>
            </div>
            <p className="text-xs text-surface-500 mt-1.5">
              Scan every box: the sheet shows one line per delivery number, and CLL = how many
              different package serial numbers (SSCC) you scanned. Re-scanning the same box won't count twice.
            </p>
            {autoCll && !aiActive && (
              <p className="text-xs text-amber-400 mt-2 flex items-start gap-1.5">
                <Sparkles size={13} className="mt-0.5 flex-shrink-0 text-violet-300" />
                <span>
                  For reliable counting, turn on <b>Smart read (AI)</b> above. On-device OCR often
                  misreads serial and delivery numbers on angled or wrinkled labels — a single wrong
                  character splits one box into several rows.
                </span>
              </p>
            )}
          </div>

          {/* Number formats */}
          <div className="border-t border-surface-800 pt-3 space-y-3">
            <div className="text-xs font-semibold text-surface-300 uppercase tracking-wide">
              Expected number formats
            </div>
            <p className="text-xs text-surface-500 -mt-1">
              Scans that don't match are flagged for manual entry.
            </p>

            <div className="grid gap-2 sm:grid-cols-[1fr_auto] items-end">
              <label className="block min-w-0">
                <span className="text-xs text-surface-400">Delivery prefix</span>
                <input
                  value={format.deliveryPrefix}
                  onChange={(e) => setFormat({ deliveryPrefix: e.target.value })}
                  className="mt-1 w-full min-w-0 bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-white font-mono text-sm"
                />
              </label>
              <label className="block">
                <span className="text-xs text-surface-400">Chars after</span>
                <input
                  type="number" min={0} max={30} inputMode="numeric"
                  value={format.deliverySuffixLen}
                  onChange={(e) => setFormat({ deliverySuffixLen: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="mt-1 w-20 bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-white text-sm"
                />
              </label>
            </div>
            <label className="flex items-center gap-2 text-xs text-surface-300">
              <input
                type="checkbox"
                checked={format.deliveryDigitsOnly}
                onChange={(e) => setFormat({ deliveryDigitsOnly: e.target.checked })}
                className="w-4 h-4 accent-primary-500"
              />
              Delivery chars are digits only (no letters)
            </label>

            <div className="grid gap-2 sm:grid-cols-[1fr_auto] items-end">
              <label className="block min-w-0">
                <span className="text-xs text-surface-400">Reference prefix</span>
                <input
                  value={format.referencePrefix}
                  onChange={(e) => setFormat({ referencePrefix: e.target.value })}
                  className="mt-1 w-full min-w-0 bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-white font-mono text-sm"
                />
              </label>
              <label className="block">
                <span className="text-xs text-surface-400"># digits</span>
                <input
                  type="number" min={0} max={30} inputMode="numeric"
                  value={format.referenceDigits}
                  onChange={(e) => setFormat({ referenceDigits: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="mt-1 w-20 bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-white text-sm"
                />
              </label>
            </div>

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <p className="text-xs text-surface-500 font-mono">
                e.g. {deliveryExample(format)}{referenceExample(format) ? ` · ${referenceExample(format)}` : ' · (any reference)'}
              </p>
              <button
                onClick={resetFormat}
                className="text-xs text-surface-400 hover:text-white underline"
              >
                Reset to defaults
              </button>
            </div>
          </div>

          {engine === 'ai' && (
            <div className="space-y-3 border-t border-surface-800 pt-3">
              <label className="block">
                <span className="text-xs font-semibold text-surface-300 uppercase tracking-wide">
                  Anthropic API key
                </span>
                <div className="mt-1 flex gap-2">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-ant-..."
                    autoComplete="off"
                    className="flex-1 bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-white font-mono text-sm"
                  />
                  <button
                    onClick={() => setShowKey((s) => !s)}
                    className="px-3 rounded-lg bg-surface-800 border border-surface-700 text-surface-300 hover:text-white"
                    title={showKey ? 'Hide' : 'Show'}
                  >
                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <span className="text-xs text-surface-500 mt-1 block">
                  Stored only in this browser. Get a key at console.anthropic.com. Charges go to your account.
                </span>
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-surface-300 uppercase tracking-wide">Model</span>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="mt-1 w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-white text-sm"
                >
                  {AI_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
              </label>
              {engine === 'ai' && !apiKey.trim() && (
                <p className="text-xs text-amber-400">
                  Enter an API key to turn on Smart read. Until then, scans use on-device OCR.
                </p>
              )}
              {apiKey.trim() !== '' && (
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={runAiTest}
                    disabled={aiTest.status === 'testing'}
                    className="flex items-center gap-1.5 text-sm bg-surface-800 hover:bg-surface-700 border border-surface-700 text-white rounded-lg px-3 py-2 disabled:opacity-50"
                  >
                    {aiTest.status === 'testing' ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} className="text-violet-300" />}
                    Test connection
                  </button>
                  {aiTest.status === 'ok' && (
                    <span className="text-xs text-emerald-400 flex items-center gap-1"><Check size={13} /> Working — AI is ready.</span>
                  )}
                  {aiTest.status === 'error' && (
                    <span className="text-xs text-amber-400 flex-1 min-w-0">{aiTest.msg}</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Batch selector */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={activeBatchId ?? ''}
          onChange={(e) => selectBatch(e.target.value)}
          className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-white max-w-[60%]"
        >
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.title || 'Untitled'} — {b.date} ({b.entries.length})
            </option>
          ))}
        </select>
        <button
          onClick={createBatch}
          className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-lg px-3 py-2 transition-colors"
        >
          <Plus size={16} /> New sheet
        </button>
        {batches.length > 1 && (
          <button
            onClick={() => {
              if (confirm('Delete this sheet and all its rows?')) deleteBatch(batch.id);
            }}
            className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 text-sm rounded-lg px-2 py-2"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Sheet header: title, date, pallet */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl p-4 grid gap-3 sm:grid-cols-2">
        <label className="sm:col-span-2 block min-w-0">
          <span className="text-xs font-semibold text-surface-300 uppercase tracking-wide">Title</span>
          <input
            value={batch.title}
            onChange={(e) => updateBatch(batch.id, { title: e.target.value })}
            placeholder="e.g. RETUR BEDRE NÆTTER/SENGEFABRIKKEN"
            className="mt-1 w-full min-w-0 bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-white"
          />
        </label>
        <label className="block min-w-0">
          <span className="text-xs font-semibold text-surface-300 uppercase tracking-wide">Date</span>
          <input
            type="date"
            value={batch.date}
            onChange={(e) => updateBatch(batch.id, { date: e.target.value })}
            className="mt-1 block w-full min-w-0 max-w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-white appearance-none sm:appearance-auto"
          />
        </label>
        <label className="block min-w-0">
          <span className="text-xs font-semibold text-surface-300 uppercase tracking-wide">Pallet (optional)</span>
          <input
            value={batch.pallet}
            onChange={(e) => updateBatch(batch.id, { pallet: e.target.value })}
            placeholder="e.g. 2"
            className="mt-1 w-full min-w-0 bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-white"
          />
        </label>
      </div>

      {/* Scan / add card */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl p-4 space-y-4">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFile}
          className="hidden"
        />

        {!draft.photo && !manualMode ? (
          <div className="space-y-3">
            {/* Rapid capture toggle */}
            <div className="flex items-center justify-between gap-3 rounded-lg border border-surface-800 bg-surface-950/40 px-3 py-2">
              <span className="flex items-center gap-2 text-sm text-white">
                <Zap size={15} className={rapidCapture ? 'text-amber-400' : 'text-surface-400'} />
                Rapid capture
                <span className="text-xs text-surface-500 hidden sm:inline">— auto-add each shot</span>
              </span>
              <button
                role="switch"
                aria-checked={rapidCapture}
                onClick={() => { setRapidCapture(!rapidCapture); setRapidCount(0); setRapidLast(''); }}
                className={clsx(
                  'relative w-11 h-6 rounded-full transition-colors flex-shrink-0',
                  rapidCapture ? 'bg-amber-500' : 'bg-surface-700'
                )}
              >
                <span className={clsx(
                  'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform',
                  rapidCapture && 'translate-x-5'
                )} />
              </button>
            </div>

            {scanning ? (
              <div className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-surface-700 rounded-xl py-8 text-surface-300">
                <Loader2 size={28} className="animate-spin text-primary-400" />
                <span className="text-sm">{aiActive ? 'Reading with AI…' : `Reading… ${Math.round(progress * 100)}%`}</span>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-surface-700 hover:border-primary-500 rounded-xl py-8 text-surface-300 hover:text-white transition-colors"
              >
                <Camera size={32} className="text-primary-400" />
                <span className="font-medium">
                  {rapidCapture
                    ? (rapidCount > 0 ? 'Take next photo' : 'Take a photo — rapid mode')
                    : 'Take a photo of a label'}
                </span>
                <span className="text-xs text-surface-500">
                  {rapidCapture
                    ? 'Each shot is read and added automatically'
                    : 'or choose an image — numbers are read automatically'}
                </span>
              </button>
            )}

            {rapidCapture && rapidCount > 0 && (
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <Check size={13} /> {rapidCount} added{rapidLast ? ` · last: ${rapidLast}` : ''}. Fix values or CLL in the list below.
              </p>
            )}
            {rapidCapture && engineNote && (
              <p className={clsx('text-xs flex items-center gap-1', engineNote.startsWith('AI read failed') ? 'text-amber-400' : 'text-violet-300')}>
                {!engineNote.startsWith('AI read failed') && <Sparkles size={12} />}
                {engineNote}
              </p>
            )}
          </div>
        ) : (
          <div className={clsx('grid gap-4', draft.photo && 'sm:grid-cols-[160px_1fr]')}>
            {draft.photo && (
            <div className="relative">
              <img src={draft.photo} alt="label" className="w-full rounded-lg border border-surface-700 object-cover max-h-56" />
              <div className="absolute top-1.5 right-1.5 flex gap-1">
                <button
                  onClick={rotateDraft}
                  title="Rotate"
                  className="bg-black/60 hover:bg-black/80 text-white rounded-md p-1.5"
                >
                  <RotateCw size={14} />
                </button>
                <button
                  onClick={() => { setDraft(emptyDraft); setShowRaw(false); }}
                  title="Remove"
                  className="bg-black/60 hover:bg-black/80 text-white rounded-md p-1.5"
                >
                  <X size={14} />
                </button>
              </div>
              {scanning && (
                <div className="absolute inset-0 bg-black/60 rounded-lg flex flex-col items-center justify-center gap-2 text-white text-sm">
                  <Loader2 className="animate-spin" />
                  {aiActive ? 'Reading with AI…' : `Reading… ${Math.round(progress * 100)}%`}
                </div>
              )}
            </div>
            )}

            <div className="space-y-3">
              {!draftValid && (draft.deliveryNumber || draft.referenceNumber) && (
                <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">
                  Check these before adding:
                  <ul className="mt-1 list-disc pl-4 space-y-0.5">
                    {draftDeliveryError && <li>{draftDeliveryError}</li>}
                    {draftReferenceError && <li>{draftReferenceError}</li>}
                  </ul>
                </div>
              )}
              <Field
                label="Delivery number"
                value={draft.deliveryNumber}
                onChange={(v) => setDraft((d) => ({ ...d, deliveryNumber: v }))}
                placeholder={deliveryExample(format)}
                invalid={!!draftDeliveryError}
              />
              <Field
                label="Reference number"
                value={draft.referenceNumber}
                onChange={(v) => setDraft((d) => ({ ...d, referenceNumber: v }))}
                placeholder={referenceExample(format) || 'reference'}
                invalid={!!draftReferenceError}
              />
              {autoCll ? (
                <Field
                  label="Package no. (SSCC)"
                  value={draft.sscc}
                  onChange={(v) => setDraft((d) => ({ ...d, sscc: v }))}
                  placeholder="370733747952374111"
                />
              ) : (
                <Field
                  label="CLL (quantity)"
                  value={draft.quantity}
                  onChange={(v) => setDraft((d) => ({ ...d, quantity: v }))}
                  placeholder="4"
                />
              )}

              {engineNote && (
                <p className={clsx(
                  'text-xs flex items-center gap-1',
                  engineNote.startsWith('AI read failed') ? 'text-amber-400' : 'text-violet-300'
                )}>
                  {!engineNote.startsWith('AI read failed') && <Sparkles size={12} />}
                  {engineNote}
                </p>
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                {draft.photo && (
                  <button
                    onClick={() => draft.photo && runScan(draft.photo)}
                    disabled={scanning}
                    className="flex items-center gap-1.5 text-sm bg-surface-800 hover:bg-surface-700 border border-surface-700 text-white rounded-lg px-3 py-2 disabled:opacity-50"
                  >
                    <ScanLine size={15} /> Re-scan
                  </button>
                )}
                <button
                  onClick={() => commitDraft()}
                  disabled={!draftValid}
                  className="flex items-center gap-1.5 text-sm bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-4 py-2 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus size={16} /> Add to list
                </button>
                {!draftValid && (draft.deliveryNumber.trim() !== '' || draft.referenceNumber.trim() !== '') && (
                  <button
                    onClick={() => commitDraft(true)}
                    className="flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300 border border-amber-500/40 rounded-lg px-3 py-2"
                  >
                    Add anyway
                  </button>
                )}
                <button
                  onClick={() => { setDraft(emptyDraft); setManualMode(false); setShowRaw(false); }}
                  className="flex items-center gap-1.5 text-sm text-surface-400 hover:text-white rounded-lg px-3 py-2"
                >
                  Cancel
                </button>
              </div>

              {draft.rawText && (
                <div className="text-xs">
                  <button
                    onClick={() => setShowRaw((s) => !s)}
                    className="flex items-center gap-1 text-surface-400 hover:text-white"
                  >
                    {showRaw ? <ChevronUp size={13} /> : <ChevronDown size={13} />} Raw scanned text
                  </button>
                  {showRaw && (
                    <pre className="mt-1 whitespace-pre-wrap bg-surface-950 border border-surface-800 rounded-lg p-2 text-surface-400 max-h-32 overflow-auto">
                      {draft.rawText}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {!draft.photo && !manualMode && (
          <button
            onClick={() => setManualMode(true)}
            className="w-full text-center text-xs text-surface-400 hover:text-white"
          >
            No camera? Add a row by hand instead
          </button>
        )}
      </div>

      {/* Entries list */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-800">
          <h2 className="font-semibold text-white">
            {autoCll ? 'Deliveries' : 'Rows'}{' '}
            <span className="text-surface-400 font-normal">
              ({autoCll ? `${groups.length} · ${batch.entries.length} scans` : batch.entries.length})
            </span>
          </h2>
        </div>

        {batch.entries.length === 0 ? (
          <div className="px-4 py-10 text-center text-surface-500 text-sm">
            No rows yet. Scan a label above to get started.
          </div>
        ) : autoCll ? (
          <ul className="divide-y divide-surface-800">
            {groups.map((g, i) => (
              <GroupRow
                key={g.deliveryNumber || i}
                index={i}
                group={g}
                onDeletePackage={(entryId) => deleteEntry(batch.id, entryId)}
              />
            ))}
          </ul>
        ) : (
          <ul className="divide-y divide-surface-800">
            {batch.entries.map((entry, i) => (
              <EntryRow
                key={entry.id}
                index={i}
                entry={entry}
                onSave={(patch) => updateEntry(batch.id, entry.id, patch)}
                onDelete={() => deleteEntry(batch.id, entry.id)}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Export toolbar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <ToolbarButton
          onClick={() => withBusy('xlsx', () => exportExcel(batch, outputRows))}
          busy={busy === 'xlsx'}
          disabled={outputRows.length === 0}
          icon={<FileSpreadsheet size={18} />}
          label="Excel"
          color="emerald"
        />
        <ToolbarButton
          onClick={() => withBusy('docx', () => exportWord(batch, outputRows))}
          busy={busy === 'docx'}
          disabled={outputRows.length === 0}
          icon={<FileText size={18} />}
          label="Word"
          color="blue"
        />
        <ToolbarButton
          onClick={() => printBatch(batch, outputRows)}
          disabled={outputRows.length === 0}
          icon={<Printer size={18} />}
          label="Print"
          color="surface"
        />
        <ToolbarButton
          onClick={() => emailBatch(batch, outputRows)}
          disabled={outputRows.length === 0}
          icon={<Mail size={18} />}
          label="Email"
          color="surface"
        />
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, invalid,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; invalid?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-surface-300 uppercase tracking-wide">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={clsx(
          'mt-1 w-full bg-surface-800 border rounded-lg px-3 py-2 text-white font-mono',
          invalid ? 'border-rose-500' : 'border-surface-700'
        )}
      />
    </label>
  );
}

function GroupRow({
  index, group, onDeletePackage,
}: {
  index: number;
  group: DeliveryGroup;
  onDeletePackage: (entryId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const cll = group.ssccs.length;

  return (
    <li className="px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-surface-500 text-sm w-6 text-right tabular-nums">{index + 1}</span>
        <div className="min-w-0 flex-1">
          <div className="font-mono text-sm text-white truncate">{formatLine(group)}</div>
          <div className="text-xs text-surface-500">
            {group.deliveryNumber || '—'} · ref {group.referenceNumber || '—'}
          </div>
        </div>
        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 flex-shrink-0">
          {cll} CLL
        </span>
        <button
          onClick={() => setOpen((o) => !o)}
          className="text-surface-400 hover:text-white p-1"
          aria-label="Show packages"
        >
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {open && (
        <ul className="mt-2 ml-9 space-y-1">
          {group.ssccs.map((s, i) => (
            <li key={group.entryIds[i]} className="flex items-center gap-2 text-xs text-surface-300">
              <span className="text-surface-500 w-5 text-right tabular-nums">{i + 1}</span>
              <span className="font-mono truncate flex-1">{s || '(no serial read)'}</span>
              <button
                onClick={() => onDeletePackage(group.entryIds[i])}
                className="text-surface-500 hover:text-rose-400 p-1"
                aria-label="Remove package"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function EntryRow({
  index, entry, onSave, onDelete,
}: {
  index: number;
  entry: LabelEntry;
  onSave: (patch: Partial<LabelEntry>) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [d, setD] = useState(entry.deliveryNumber);
  const [r, setR] = useState(entry.referenceNumber);
  const [q, setQ] = useState(entry.quantity);

  function save() {
    onSave({ deliveryNumber: d.trim(), referenceNumber: r.trim(), quantity: q.trim() });
    setEditing(false);
  }

  if (editing) {
    return (
      <li className="p-3 bg-surface-950/40 grid gap-2 sm:grid-cols-[1fr_1fr_80px_auto]">
        <input value={d} onChange={(e) => setD(e.target.value)} placeholder="Delivery" className="bg-surface-800 border border-surface-700 rounded px-2 py-1.5 text-sm text-white font-mono" />
        <input value={r} onChange={(e) => setR(e.target.value)} placeholder="Reference" className="bg-surface-800 border border-surface-700 rounded px-2 py-1.5 text-sm text-white font-mono" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="CLL" className="bg-surface-800 border border-surface-700 rounded px-2 py-1.5 text-sm text-white font-mono" />
        <div className="flex gap-1">
          <button onClick={save} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded px-2 py-1.5"><Check size={15} /></button>
          <button onClick={() => setEditing(false)} className="bg-surface-800 hover:bg-surface-700 text-white rounded px-2 py-1.5"><X size={15} /></button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-3 px-4 py-3 hover:bg-surface-800/40 group">
      <span className="text-surface-500 text-sm w-6 text-right tabular-nums">{index + 1}</span>
      {entry.photo && (
        <img src={entry.photo} alt="" className="w-9 h-9 rounded object-cover border border-surface-700 flex-shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <div className="font-mono text-sm text-white truncate">{formatLine(entry)}</div>
        <div className="text-xs text-surface-500">
          {entry.deliveryNumber.toUpperCase() || '—'} · ref {entry.referenceNumber.toUpperCase() || '—'}
        </div>
      </div>
      <button onClick={() => { setD(entry.deliveryNumber); setR(entry.referenceNumber); setQ(entry.quantity); setEditing(true); }} className="text-surface-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2 py-1">
        Edit
      </button>
      <button onClick={onDelete} className="text-surface-500 hover:text-rose-400 p-1">
        <Trash2 size={16} />
      </button>
    </li>
  );
}

function ToolbarButton({
  onClick, icon, label, color, busy, disabled,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  color: 'emerald' | 'blue' | 'surface';
  busy?: boolean;
  disabled?: boolean;
}) {
  const colors = {
    emerald: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    blue: 'bg-primary-600 hover:bg-primary-500 text-white',
    surface: 'bg-surface-800 hover:bg-surface-700 text-white border border-surface-700',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled || busy}
      className={clsx(
        'flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
        colors[color]
      )}
    >
      {busy ? <Loader2 size={18} className="animate-spin" /> : icon}
      {label}
    </button>
  );
}
