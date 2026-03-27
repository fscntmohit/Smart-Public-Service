import { useState } from 'react';
import { Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import Footer from '../../components/ui/footer';

export default function HelpContact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill all fields');
      return;
    }
    toast.success('Message submitted successfully');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-4">
          <div className="card p-5 md:col-span-1">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Contact Info</h2>
            <div className="space-y-3 text-sm text-slate-600">
              <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-indigo-500" /> support@ps-crm.com</p>
              <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-indigo-500" /> +91 1800-123-456</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="card p-5 md:col-span-2">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Contact Us</h1>
            <p className="text-sm text-slate-500 mb-5">Need help? Send your message and the support team will contact you.</p>

            <div className="space-y-3">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Your name"
                className="input-field"
              />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Your email"
                className="input-field"
              />
              <textarea
                rows={5}
                value={form.message}
                onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                placeholder="Write your message"
                className="input-field resize-none"
              />
              <button type="submit" className="btn-primary">Send Message</button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
