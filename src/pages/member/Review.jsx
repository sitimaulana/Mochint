import React, { useState } from 'react';
import { Star, Send, Award, MessageSquare } from 'lucide-react';
import { postReview } from '../../api/client';

const Review = () => {
  const [formData, setFormData] = useState({ rating: 5, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = JSON.parse(localStorage.getItem('active_user'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.comment) return alert("Mohon tuliskan komentar Anda");

    setIsSubmitting(true);
    try {
      await postReview({
        name: user.name,
        location: user.address || "Verified Member",
        ...formData
      });
      alert("Review Anda berhasil dikirim dan akan tampil di Homepage!");
      setFormData({ rating: 5, comment: '' });
    } catch (error) {
      alert("Gagal mengirim review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto animate-in fade-in duration-700 font-sans">
      <div className="mb-12 text-center md:text-left space-y-2">
        <h1 className="text-4xl md:text-6xl font-display font-bold text-[#3E2723] tracking-tighter">My Review</h1>
        <p className="text-[#8D6E63] font-medium text-lg">Bagikan pengalaman kecantikan Anda di Mochint.</p>
      </div>

      <div className="bg-white rounded-[50px] shadow-[0_40px_80px_-20px_rgba(62,39,35,0.1)] border border-gray-50 overflow-hidden flex flex-col md:flex-row">
        <div className="bg-[#3E2723] p-12 text-white md:w-1/3 flex flex-col justify-center items-center text-center">
          <div className="w-20 h-20 bg-white/10 rounded-[30px] flex items-center justify-center mb-6 border border-white/20 shadow-inner">
            <Award size={40} className="text-[#D7CCC8]" />
          </div>
          <h3 className="font-display font-bold text-xl mb-2">Verified Voice</h3>
          <p className="text-xs text-[#D7CCC8] leading-relaxed opacity-80">Review Anda membantu pelanggan lain dan membantu kami memberikan layanan terbaik.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-12 flex-1 space-y-8 bg-white text-left">
          <div className="space-y-4">
            <label className="text-[11px] font-black text-[#A1887F] uppercase tracking-widest block font-sans ml-1">Kualitas Layanan (Rating)</label>
            <div className="flex gap-3 p-4 bg-[#FDFBF7] rounded-2xl w-fit border border-gray-100">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="focus:outline-none transition-transform hover:scale-125"
                >
                  <Star size={32} fill={star <= formData.rating ? "#FACC15" : "none"} className={star <= formData.rating ? "text-yellow-400" : "text-gray-300"} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[11px] font-black text-[#A1887F] uppercase tracking-widest block font-sans ml-1">Ceritakan Pengalaman Anda</label>
            <textarea
              rows="5"
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              placeholder="Tuliskan testimoni Anda di sini..."
              className="w-full px-6 py-5 rounded-3xl bg-[#FDFBF7] border-2 border-transparent focus:border-[#8D6E63] focus:bg-white outline-none transition-all font-medium text-[#3E2723] shadow-inner resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-5 bg-[#3E2723] text-white font-display font-bold rounded-[25px] shadow-xl shadow-[#3E2723]/20 hover:bg-[#8D6E63] transition-all flex items-center justify-center gap-4 uppercase tracking-widest text-xs active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? "Mengirim..." : <><Send size={18} /> Publish Review</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Review;