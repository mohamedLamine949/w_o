import React, { useState } from 'react';
import { X, ShieldCheck, Zap, CheckCircle, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { initiatePaiementProCheckout } from '../lib/paiementPro';
import { supabase } from '../lib/supabaseClient';

export default function PaiementModal({ isOpen, onClose, gridsToPlay, totalCost, activeDraw, onPaymentSuccess }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] = useState(null);

  if (!isOpen) return null;

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    if (!phoneNumber || phoneNumber.trim().length < 8) {
      setErrorMessage('Veuillez saisir un numéro de téléphone Orange Money valide (ex: 70 00 00 00).');
      setIsLoading(false);
      return;
    }

    const cleanPhone = phoneNumber.startsWith('+223') ? phoneNumber : `+223 ${phoneNumber.trim()}`;
    const clientName = fullName.trim() || 'Joueur WinnerOne';

    try {
      // 1. Initialiser la transaction PaiementPro (Merchant ID: PP-F92288, Channel: OMML)
      const res = await initiatePaiementProCheckout({
        amount: totalCost,
        description: `WinnerOne Mali - ${gridsToPlay.length} Grille(s)`,
        customerPhoneNumber: cleanPhone,
        customerFirstName: clientName,
      });

      if (!res.success) {
        throw new Error('Erreur lors du traitement avec PaiementPro Orange Money');
      }

      // 2. Si PaiementPro a fourni une URL de paiement réelle → REDIRECTION DIRECTE
      if (res.url) {
        // Sauvegarder les grilles en PENDING dans Supabase avant redirection
        await saveTicketsPending(cleanPhone, clientName, res.referenceNumber);
        // REDIRECTION RÉELLE vers la passerelle de paiement Orange Money
        window.location.href = res.url;
        return;
      }

      // 3. Sinon (mode fallback / test local) : enregistrer directement comme PAID
      await saveTicketsPaid(cleanPhone, clientName, res.referenceNumber);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      setSuccessData({
        reference: res.referenceNumber,
        phone: cleanPhone,
        ticketCount: gridsToPlay.length,
        total: totalCost,
      });

      if (onPaymentSuccess) onPaymentSuccess();
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Échec de la transaction. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  // Sauvegarder les grilles en statut PENDING (avant redirection PaiementPro)
  const saveTicketsPending = async (cleanPhone, clientName, referenceNumber) => {
    const userId = await getOrCreateUserId(cleanPhone, clientName);

    for (const grid of gridsToPlay) {
      const ticketRef = referenceNumber + '-' + Math.floor(Math.random() * 1000);

      await supabase.from('tickets').insert({
        user_id: userId,
        draw_id: activeDraw?.id && activeDraw.id !== 'mock-upcoming' ? activeDraw.id : null,
        main_numbers: grid.main,
        star_numbers: grid.star,
        ticket_price: 200,
        reference_number: ticketRef,
        payment_channel: 'OMML',
        payment_status: 'PENDING',
      });
    }

    await supabase.from('transactions').insert({
      user_id: userId,
      type: 'TICKET_PURCHASE',
      amount: totalCost,
      reference: referenceNumber,
      status: 'PENDING',
    });
  };

  // Sauvegarder les grilles en statut PAID (mode fallback local)
  const saveTicketsPaid = async (cleanPhone, clientName, referenceNumber) => {
    const userId = await getOrCreateUserId(cleanPhone, clientName);

    for (const grid of gridsToPlay) {
      const ticketRef = referenceNumber + '-' + Math.floor(Math.random() * 1000);

      await supabase.from('tickets').insert({
        user_id: userId,
        draw_id: activeDraw?.id && activeDraw.id !== 'mock-upcoming' ? activeDraw.id : null,
        main_numbers: grid.main,
        star_numbers: grid.star,
        ticket_price: 200,
        reference_number: ticketRef,
        payment_channel: 'OMML',
        payment_status: 'PAID',
      });
    }

    await supabase.from('transactions').insert({
      user_id: userId,
      type: 'TICKET_PURCHASE',
      amount: totalCost,
      reference: referenceNumber,
      status: 'SUCCESS',
    });
  };

  // Récupérer ou créer l'ID utilisateur
  const getOrCreateUserId = async (cleanPhone, clientName) => {
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone_number', cleanPhone)
      .maybeSingle();

    if (existingUser) return existingUser.id;

    const { data: newUser } = await supabase
      .from('profiles')
      .insert({
        phone_number: cleanPhone,
        full_name: clientName,
        balance: 0,
      })
      .select('id')
      .single();

    return newUser?.id || null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl text-slate-800">
        
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>

        {!successData ? (
          <div>
            {/* HEADER */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 border border-orange-300 flex items-center justify-center">
                <Zap className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#00205B]">Paiement Orange Money Mali</h3>
                <p className="text-xs text-slate-500">PaiementPro Code Provider : OMML</p>
              </div>
            </div>

            {/* RECAP */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-6 space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Nombre de Grilles :</span>
                <span className="font-bold text-slate-800">{gridsToPlay.length} Grille(s)</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Prix par Grille :</span>
                <span className="font-bold text-amber-600">200 FCFA</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-[#00205B]">
                <span>Montant Total :</span>
                <span className="text-base">{totalCost.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>

            {/* FORM */}
            <form onSubmit={handleProcessPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nom & Prénom <span className="text-slate-400 font-normal">(Optionnel)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Mohamed Koné"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#00205B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Numéro Orange Money Mali <span className="text-orange-500 font-black">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-bold">
                    +223
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="70 00 00 00"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-14 pr-4 py-2.5 text-sm text-slate-800 font-mono focus:outline-none focus:border-orange-400"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                  {errorMessage}
                </div>
              )}

              {/* BOUTON JAUNE FDJ ÉCLATANT */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-2xl font-black text-base fdj-yellow-btn flex items-center justify-center gap-2.5 shadow-xl"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-[#00205B]" />
                    <span>Traitement Orange Money...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 text-[#00205B]" />
                    <span>Confirmer & Payer {totalCost.toLocaleString('fr-FR')} FCFA</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* SUCCESS STATE */
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle className="w-10 h-10" />
            </div>

            <h3 className="text-xl font-black text-[#00205B]">Billet(s) Validé(s) avec Succès !</h3>
            <p className="text-xs text-slate-600">
              Vos <span className="text-amber-600 font-bold">{successData.ticketCount} grille(s)</span> ont été enregistrées pour le tirage de ce soir à 20h00 GMT.
            </p>

            <div className="bg-slate-50 p-4 rounded-xl text-left border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>Réf. Transaction :</span>
                <span className="font-mono text-[#00205B] font-bold">{successData.reference}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Téléphone :</span>
                <span className="font-mono text-slate-800">{successData.phone}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition shadow"
            >
              Fermer et Voir mes Billets
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
