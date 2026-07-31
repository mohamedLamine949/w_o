import React, { useState } from 'react';
import { X, Smartphone, ShieldCheck, Zap, CheckCircle, Loader2 } from 'lucide-react';
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
        description: `WinnerOne Mali - ${gridsToPlay.length} Grille(s) EuroMillions`,
        customerPhoneNumber: cleanPhone,
        customerFirstName: clientName,
      });

      if (!res.success) {
        throw new Error('Erreur lors du traitement avec PaiementPro Orange Money');
      }

      // 2. Créer ou récupérer le profil utilisateur dans Supabase
      let userId = null;
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone_number', cleanPhone)
        .maybeSingle();

      if (existingUser) {
        userId = existingUser.id;
      } else {
        const { data: newUser, error: userError } = await supabase
          .from('profiles')
          .insert({
            phone_number: cleanPhone,
            full_name: clientName,
            balance: 0,
          })
          .select('id')
          .single();

        if (userError) console.warn('Could not insert profile:', userError);
        userId = newUser?.id || null;
      }

      // 3. Enregistrer les tickets dans Supabase
      const createdTickets = [];
      for (const grid of gridsToPlay) {
        const ticketRef = res.referenceNumber + '-' + Math.floor(Math.random() * 1000);
        
        const { data: ticketData, error: ticketError } = await supabase
          .from('tickets')
          .insert({
            user_id: userId,
            draw_id: activeDraw?.id || null,
            main_numbers: grid.main,
            star_numbers: grid.star,
            ticket_price: 200,
            reference_number: ticketRef,
            payment_channel: 'OMML',
            payment_status: 'PAID',
          })
          .select()
          .single();

        if (ticketData) createdTickets.push(ticketData);
      }

      // 4. Enregistrer la transaction
      await supabase.from('transactions').insert({
        user_id: userId,
        type: 'TICKET_PURCHASE',
        amount: totalCost,
        reference: res.referenceNumber,
        status: 'SUCCESS',
      });

      // 5. Déclencher les confettis
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 border border-yellow-500/30 shadow-2xl">
        
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 text-gray-400 hover:text-white flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>

        {!successData ? (
          <div>
            {/* HEADER */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
                <Zap className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Paiement Orange Money Mali</h3>
                <p className="text-xs text-gray-400">PaiementPro Code Provider : OMML</p>
              </div>
            </div>

            {/* RECAP */}
            <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 mb-6 space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Nombre de Grilles :</span>
                <span className="font-bold text-gray-200">{gridsToPlay.length} Grille(s)</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Prix par Grille :</span>
                <span className="font-bold text-yellow-400">200 FCFA</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-black text-white">
                <span>Montant Total :</span>
                <span className="gold-gradient-text text-base">{totalCost.toLocaleString('fr-FR')} FCFA</span>
              </div>
            </div>

            {/* FORM */}
            <form onSubmit={handleProcessPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Nom & Prénom <span className="text-gray-500">(Optionnel)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Mohamed Koné"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Numéro Orange Money Mali <span className="text-orange-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">
                    +223
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="70 00 00 00"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-14 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/50 font-mono"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-bold text-sm gold-button flex items-center justify-center gap-2 shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                    <span>Traitement Orange Money...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Confirmer & Payer {totalCost.toLocaleString('fr-FR')} FCFA</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* SUCCESS STATE */
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle className="w-10 h-10" />
            </div>

            <h3 className="text-xl font-bold text-white">Billet(s) Validé(s) avec Succès !</h3>
            <p className="text-xs text-gray-300">
              Vos <span className="text-yellow-400 font-bold">{successData.ticketCount} grille(s)</span> ont été enregistrées pour le tirage de ce soir à 20h00 GMT.
            </p>

            <div className="bg-slate-900 p-4 rounded-xl text-left border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between text-gray-400">
                <span>Réf. Transaction :</span>
                <span className="font-mono text-white font-bold">{successData.reference}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Téléphone :</span>
                <span className="font-mono text-white">{successData.phone}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white transition"
            >
              Fermer et Voir mes Billets
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
