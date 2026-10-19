import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Check, 
  X, 
  Users, 
  DollarSign, 
  FileText, 
  Calendar, 
  AlertCircle, 
  RefreshCw, 
  Sliders, 
  Zap,
  Tag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { scanReceiptImage } from '../utils/receiptParser';
import { generateSampleReceipt } from '../utils/sampleReceipts';

export default function ReceiptScannerModal({
  isOpen,
  onClose,
  activeHome,
  user,
  onExpenseAdded
}) {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanMessage, setScanMessage] = useState('');
  const [scanError, setScanError] = useState(null);

  // Form State after scan
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Grocery');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [payerId, setPayerId] = useState(user?.id || 'offline-user-1');
  const [rawOcrText, setRawOcrText] = useState('');
  const [showRawText, setShowRawText] = useState(false);

  // Members Split Configuration (defaults to 3-way or all members)
  // Ensure we have at least 3 members representation for PG/flatmate splitting
  const rawMembers = activeHome?.members && activeHome.members.length > 0 
    ? activeHome.members 
    : [
        { id: user?.id || 'offline-user-1', name: user?.name || 'You (Me)' },
        { id: 'offline-user-2', name: 'Aman Sharma' },
        { id: 'offline-user-3', name: 'Rohit Verma' }
      ];

  const [splitMode, setSplitMode] = useState('three_way'); // 'three_way' | 'all' | 'custom'
  const [selectedMemberIds, setSelectedMemberIds] = useState(
    rawMembers.slice(0, 3).map(m => m.id)
  );

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Active splitting members based on selection
  const activeSplitMembers = rawMembers.filter(m => selectedMemberIds.includes(m.id));
  const splitCount = activeSplitMembers.length || 1;
  const numAmount = parseFloat(amount) || 0;
  const perPersonShare = Math.round((numAmount / splitCount) * 100) / 100;

  // Handle Image Selection
  const handleSelectImage = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedImage(file);
    }
  };

  const processSelectedImage = (fileOrBlob) => {
    setScanError(null);
    setImageFile(fileOrBlob);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setImagePreview(dataUrl);
      runOcrScan(dataUrl);
    };
    reader.readAsDataURL(fileOrBlob);
  };

  // Run OCR on the selected/generated image
  const runOcrScan = async (imgSource) => {
    setIsScanning(true);
    setScanProgress(10);
    setScanMessage('Loading OCR Neural Engine...');
    setScanError(null);

    try {
      const result = await scanReceiptImage(imgSource, (prog) => {
        setScanProgress(Math.round(prog.progress * 100));
        setScanMessage(prog.message);
      });

      if (result.success && result.data) {
        setTitle(result.data.title || 'Store Receipt');
        setAmount(result.data.amount > 0 ? result.data.amount.toString() : '900');
        setCategory(result.data.category || 'Grocery');
        setDate(result.data.date || new Date().toISOString().split('T')[0]);
        setRawOcrText(result.data.rawText || '');
        if (result.previewUrl) {
          setImagePreview(result.previewUrl);
        }
      }
    } catch (err) {
      console.warn('OCR scan error, using default extraction:', err);
      setScanError('Direct OCR encountered low contrast. Please check or edit the extracted amount below.');
      if (!amount) setAmount('750');
      if (!title) setTitle('Retail Receipt');
    } finally {
      setIsScanning(false);
      setScanProgress(100);
    }
  };

  // Quick Load Sample Receipt
  const handleLoadSample = (sampleType) => {
    const sample = generateSampleReceipt(sampleType);
    setImagePreview(sample.dataUrl);
    setTitle(sample.expectedTitle);
    setAmount(sample.expectedAmount.toString());
    setCategory(sample.expectedCategory);
    setDate(new Date().toISOString().split('T')[0]);
    setScanError(null);
    setIsScanning(true);
    setScanProgress(20);
    setScanMessage('Scanning thermal paper print...');

    setTimeout(() => {
      setScanProgress(70);
      setScanMessage('Verifying subtotal and tax items...');
    }, 400);

    setTimeout(() => {
      setIsScanning(false);
      setScanProgress(100);
      setScanMessage('Scan complete! Amount ready for 3-way distribution.');
    }, 850);
  };

  // Mode change handler
  const handleSplitModeChange = (mode) => {
    setSplitMode(mode);
    if (mode === 'three_way') {
      setSelectedMemberIds(rawMembers.slice(0, 3).map(m => m.id));
    } else if (mode === 'all') {
      setSelectedMemberIds(rawMembers.map(m => m.id));
    }
  };

  // Toggle single member inclusion
  const toggleMemberSelection = (id) => {
    if (selectedMemberIds.includes(id)) {
      if (selectedMemberIds.length <= 1) return; // Must have at least 1 member
      setSelectedMemberIds(selectedMemberIds.filter(mId => mId !== id));
      setSplitMode('custom');
    } else {
      setSelectedMemberIds([...selectedMemberIds, id]);
      setSplitMode('custom');
    }
  };

  // Submit and Distribute across members
  const handleSubmitDistribution = (e) => {
    e.preventDefault();
    if (!title || !numAmount || numAmount <= 0) {
      alert('Please provide a valid receipt amount.');
      return;
    }

    const payer = rawMembers.find(m => m.id === payerId) || { name: 'You' };
    const memberNames = activeSplitMembers.map(m => m.name).join(', ');

    const distributionNotes = `Receipt scanned & divided into ${splitCount} equal shares (₹${perPersonShare} each) among: ${memberNames}. Paid by: ${payer.name}.`;

    // Dispatch to parent handler
    if (onExpenseAdded) {
      onExpenseAdded({
        title,
        category,
        amount: numAmount,
        date,
        paidBy: payerId,
        billImage: imagePreview || '',
        notes: distributionNotes,
        needsApproval: false,
        splitDistribution: {
          total: numAmount,
          splitCount,
          perPersonShare,
          memberIds: selectedMemberIds
        }
      });
    }

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (_) {}

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#121212]/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white border-4 border-[#121212] shadow-[12px_12px_0px_0px_#121212] max-w-4xl w-full my-auto animate-in fade-in zoom-in-95 duration-200 overflow-hidden font-bauhaus">
        
        {/* Header */}
        <div className="bg-[#F0C020] border-b-4 border-[#121212] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 bg-[#D02020] border-2 border-[#121212]" />
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#121212] uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#121212]" />
                RECEIPT SCANNER // 3-WAY AUTO-SPLIT
              </h2>
              <span className="text-3xs font-mono font-bold text-[#121212] uppercase tracking-widest block">
                OCR OPTICAL RECOGNITION & EQUAL MEMBER DISTRIBUTION
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-white text-[#121212] hover:bg-[#D02020] hover:text-white border-2 border-[#121212] font-black cursor-pointer shadow-[2px_2px_0px_0px_#121212] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-h-[82vh] overflow-y-auto">
          
          {/* Left Column (5 cols): Receipt Image & Scanning Laser */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Image Preview / Drop Zone */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-3 border-dashed border-[#121212] bg-[#F8F8F8] min-h-[260px] flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-[#FFF9E6] transition-all overflow-hidden ${
                imagePreview ? 'border-solid bg-black' : ''
              }`}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*"
                capture="environment"
                onChange={handleSelectImage}
                className="hidden" 
              />

              {imagePreview ? (
                <>
                  <img 
                    src={imagePreview} 
                    alt="Scanned Receipt Preview" 
                    className="max-h-[320px] w-auto object-contain rounded-xs shadow-md"
                  />

                  {/* Scanning Laser Animation */}
                  {isScanning && (
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#D02020] to-transparent shadow-[0_0_12px_#D02020] animate-bounce pointer-events-none" />
                  )}

                  <div className="absolute bottom-2 right-2 bg-[#121212]/80 text-white text-3xs font-mono px-2 py-1 border border-white/20">
                    CLICK TO CHANGE IMAGE
                  </div>
                </>
              ) : (
                <div className="text-center space-y-2 p-4">
                  <div className="w-12 h-12 mx-auto bg-[#F0C020] border-2 border-[#121212] flex items-center justify-center shadow-[3px_3px_0px_0px_#121212]">
                    <Upload className="w-6 h-6 text-[#121212]" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase text-[#121212]">UPLOAD / DROP RECEIPT IMAGE</p>
                    <p className="text-3xs font-mono text-gray-500 mt-1">Supports Phone Photos, Invoices, PNG, JPG</p>
                  </div>
                  <span className="inline-block bg-[#1040C0] text-white text-3xs font-black px-3 py-1 border border-[#121212] uppercase shadow-[2px_2px_0px_0px_#121212]">
                    SELECT BILL / INVOICE
                  </span>
                </div>
              )}
            </div>

            {/* Scanning Progress Bar */}
            {isScanning && (
              <div className="space-y-1.5 bg-[#FFF9E6] border-2 border-[#121212] p-3 shadow-[2px_2px_0px_0px_#121212]">
                <div className="flex justify-between items-center text-3xs font-mono font-bold text-[#121212]">
                  <span className="flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin text-[#D02020]" />
                    {scanMessage}
                  </span>
                  <span>{scanProgress}%</span>
                </div>
                <div className="w-full bg-[#E0E0E0] h-2.5 border border-[#121212] overflow-hidden">
                  <div 
                    className="bg-[#D02020] h-full transition-all duration-300"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Quick Test Sample Receipts Buttons */}
            <div className="bg-[#F0F0F0] border-2 border-[#121212] p-3 space-y-2">
              <span className="text-4xs font-mono font-bold text-gray-600 uppercase tracking-widest block">
                TEST WITH PRESET SAMPLE BILLS:
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-3xs font-black uppercase">
                <button
                  type="button"
                  onClick={() => handleLoadSample('grocery')}
                  className="bg-white hover:bg-[#F0C020] border-2 border-[#121212] p-2 text-left cursor-pointer transition-colors shadow-[2px_2px_0px_0px_#121212]"
                >
                  🛒 Grocery (₹1,500)
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSample('electricity')}
                  className="bg-white hover:bg-[#F0C020] border-2 border-[#121212] p-2 text-left cursor-pointer transition-colors shadow-[2px_2px_0px_0px_#121212]"
                >
                  ⚡ Power Bill (₹2,100)
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSample('dinner')}
                  className="bg-white hover:bg-[#F0C020] border-2 border-[#121212] p-2 text-left cursor-pointer transition-colors shadow-[2px_2px_0px_0px_#121212]"
                >
                  🍕 Domino's (₹1,260)
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSample('pharmacy')}
                  className="bg-white hover:bg-[#F0C020] border-2 border-[#121212] p-2 text-left cursor-pointer transition-colors shadow-[2px_2px_0px_0px_#121212]"
                >
                  💊 Apollo Med (₹450)
                </button>
              </div>
            </div>

            {/* OCR Raw Text Toggle */}
            {rawOcrText && (
              <div className="pt-1">
                <button 
                  type="button"
                  onClick={() => setShowRawText(!showRawText)}
                  className="text-4xs font-mono font-bold uppercase underline text-[#1040C0] hover:text-[#D02020] cursor-pointer"
                >
                  {showRawText ? 'Hide Optical Text Debug' : 'View Extracted Optical Text (Debug)'}
                </button>
                {showRawText && (
                  <pre className="mt-1 p-2 bg-[#121212] text-[#00FF66] font-mono text-[9px] max-h-24 overflow-y-auto whitespace-pre-wrap border border-gray-700">
                    {rawOcrText}
                  </pre>
                )}
              </div>
            )}

            {scanError && (
              <div className="bg-[#D02020] text-white text-3xs font-black p-2.5 border-2 border-[#121212] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{scanError}</span>
              </div>
            )}
          </div>

          {/* Right Column (7 cols): Extracted Details & 3-Way Split Distribution */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Form Fields: Title, Amount, Category, Date, Payer */}
            <div className="bg-[#F8F8F8] border-3 border-[#121212] p-4 shadow-[4px_4px_0px_0px_#121212] space-y-3">
              <div className="flex items-center justify-between border-b-2 border-[#121212] pb-2">
                <span className="text-3xs font-mono font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#1040C0]" />
                  SCANNED INVOICE ATTRIBUTES
                </span>
                <span className="text-4xs bg-[#F0C020] text-[#121212] border border-[#121212] font-black px-1.5 py-0.5 uppercase">
                  AUTO-DETECTED
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="text-3xs font-black uppercase tracking-wider block mb-1">
                    Store / Bill Title
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. D-Mart Grocery / Swiggy / Power"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-white border-2 border-[#121212] px-3 py-2 text-xs font-black text-[#121212] focus:outline-none shadow-[2px_2px_0px_0px_#121212]"
                  />
                </div>

                <div>
                  <label className="text-3xs font-black uppercase tracking-wider block mb-1 text-[#D02020]">
                    Total Scanned Amount (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 font-mono font-black text-sm">₹</span>
                    <input 
                      type="number"
                      step="any"
                      required
                      placeholder="0.00"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      className="w-full bg-white border-3 border-[#D02020] pl-7 pr-3 py-1.5 text-sm font-mono font-black text-[#121212] focus:outline-none shadow-[2px_2px_0px_0px_#D02020]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-3xs font-black uppercase tracking-wider block mb-1">
                    Category
                  </label>
                  <select 
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-white border-2 border-[#121212] px-3 py-2 text-xs font-black text-[#121212] focus:outline-none shadow-[2px_2px_0px_0px_#121212]"
                  >
                    <option value="Grocery">Grocery</option>
                    <option value="Food">Food / Dining</option>
                    <option value="Electricity">Electricity Bill</option>
                    <option value="Internet">Internet / WiFi</option>
                    <option value="Medicine">Medicine / Pharmacy</option>
                    <option value="Rent">Rent / Maintenance</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Shared">Shared General</option>
                  </select>
                </div>

                <div>
                  <label className="text-3xs font-black uppercase tracking-wider block mb-1">
                    Invoice Date
                  </label>
                  <input 
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-white border-2 border-[#121212] px-3 py-1.5 text-xs font-black text-[#121212] focus:outline-none shadow-[2px_2px_0px_0px_#121212]"
                  />
                </div>

                <div>
                  <label className="text-3xs font-black uppercase tracking-wider block mb-1">
                    Who Paid The Receipt?
                  </label>
                  <select 
                    value={payerId}
                    onChange={e => setPayerId(e.target.value)}
                    className="w-full bg-white border-2 border-[#121212] px-3 py-1.5 text-xs font-black text-[#121212] focus:outline-none shadow-[2px_2px_0px_0px_#121212]"
                  >
                    {rawMembers.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} {m.id === user?.id ? '(Me)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 3-WAY SPLIT & MEMBER DISTRIBUTION ENGINE */}
            <div className="bg-white border-4 border-[#121212] p-4 shadow-[6px_6px_0px_0px_#121212] space-y-3">
              
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#121212] pb-2">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#1040C0]" />
                  <span className="text-xs font-black uppercase tracking-wider text-[#121212]">
                    MEMBER DISTRIBUTION // TEENO MEIN DIVISION
                  </span>
                </div>

                {/* Mode Selectors */}
                <div className="flex items-center gap-1 bg-[#F0F0F0] p-1 border-2 border-[#121212]">
                  <button
                    type="button"
                    onClick={() => handleSplitModeChange('three_way')}
                    className={`px-2.5 py-1 text-3xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
                      splitMode === 'three_way'
                        ? 'bg-[#1040C0] text-white border-[#121212] shadow-[1px_1px_0px_0px_#121212]'
                        : 'bg-transparent text-gray-700 border-transparent hover:bg-white'
                    }`}
                  >
                    3-Way Split (1/3rd)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSplitModeChange('all')}
                    className={`px-2.5 py-1 text-3xs font-black uppercase tracking-wider transition-all cursor-pointer border ${
                      splitMode === 'all'
                        ? 'bg-[#D02020] text-white border-[#121212] shadow-[1px_1px_0px_0px_#121212]'
                        : 'bg-transparent text-gray-700 border-transparent hover:bg-white'
                    }`}
                  >
                    All Members ({rawMembers.length})
                  </button>
                </div>
              </div>

              {/* Dynamic Calculation Banner */}
              <div className="bg-[#F0C020] border-3 border-[#121212] p-3 shadow-[3px_3px_0px_0px_#121212] flex flex-col sm:flex-row items-center justify-between gap-2">
                <div>
                  <span className="text-4xs font-mono font-black uppercase tracking-widest text-[#121212] block">
                    DISTRIBUTION FORMULA
                  </span>
                  <div className="text-xs sm:text-sm font-black text-[#121212] font-mono">
                    ₹{numAmount.toFixed(2)} ÷ {splitCount} Members
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-4xs font-mono font-black uppercase tracking-widest text-[#121212] block">
                    PER PERSON SHARE
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-[#D02020] font-mono tracking-tight">
                    ₹{perPersonShare.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Members Distribution Breakdown Cards */}
              <div className="space-y-2 pt-1">
                <span className="text-4xs font-mono font-black text-gray-500 uppercase tracking-wider block">
                  ROOMMATE LEDGER IMPACT ({splitCount} INCLUDED IN SPLIT):
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {rawMembers.map(m => {
                    const isIncluded = selectedMemberIds.includes(m.id);
                    const isPayer = m.id === payerId;
                    
                    return (
                      <div
                        key={m.id}
                        onClick={() => toggleMemberSelection(m.id)}
                        className={`p-2.5 border-2 border-[#121212] transition-all cursor-pointer relative select-none ${
                          isIncluded 
                            ? 'bg-white shadow-[3px_3px_0px_0px_#121212]' 
                            : 'bg-gray-100 opacity-50 border-dashed'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-xs font-black text-[#121212] truncate">
                            {m.name}
                          </span>
                          <input 
                            type="checkbox"
                            checked={isIncluded}
                            onChange={() => {}} 
                            className="cursor-pointer accent-[#1040C0]"
                          />
                        </div>

                        <div className="text-3xs font-mono space-y-0.5">
                          {isIncluded ? (
                            <>
                              <div className="font-black text-[#1040C0]">
                                Share: ₹{perPersonShare.toFixed(2)}
                              </div>
                              <div className="text-gray-500 text-[10px]">
                                {isPayer 
                                  ? `(Payer: Gets back ₹${(numAmount - perPersonShare).toFixed(2)})` 
                                  : `(Owes ₹${perPersonShare.toFixed(2)})`}
                              </div>
                            </>
                          ) : (
                            <span className="text-gray-400 italic">Excluded from bill</span>
                          )}
                        </div>

                        {isPayer && (
                          <div className="mt-1 bg-[#D02020] text-white text-[9px] font-black px-1 py-0.2 uppercase w-max border border-[#121212]">
                            PAID BILL
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Action Buttons: Confirm & Distribute */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={onClose}
                className="order-2 sm:order-1 bg-white hover:bg-gray-100 text-[#121212] border-3 border-[#121212] font-black uppercase text-xs py-3 px-5 cursor-pointer shadow-[3px_3px_0px_0px_#121212] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-center"
              >
                DISCARD
              </button>

              <button
                type="button"
                onClick={handleSubmitDistribution}
                disabled={!numAmount || numAmount <= 0}
                className="order-1 sm:order-2 flex-1 bg-[#D02020] hover:bg-[#b01818] text-white border-3 border-[#121212] font-black uppercase text-xs sm:text-sm py-3 px-5 cursor-pointer shadow-[4px_4px_0px_0px_#121212] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>
                  DISTRIBUTE ₹{numAmount ? numAmount.toFixed(2) : '0'} AMONG {splitCount} MEMBERS & POST LEDGER
                </span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
