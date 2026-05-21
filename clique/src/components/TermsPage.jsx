import { FileText, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-8 font-medium text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Premium Header */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-xl overflow-hidden relative mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/30 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-100/30 rounded-full blur-3xl -z-10" />
          
          <div className="flex items-center gap-3 px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider w-fit mb-6">
            <FileText className="w-4 h-4" /> Legal & Terms
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Terms & Conditions
          </h1>
          <p className="text-slate-500 font-medium">
            Last updated <span className="text-slate-800">May 20, 2026</span>
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-xl prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-8">
          
          {/* Summary Alert */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm md:text-base">
            <p className="m-0 font-medium text-slate-700">
              Welcome to <strong>Clique</strong>! These Terms and Conditions govern your access to and use of our website, mobile application, database integrations, and matching services. By registering an account, completing your verification, or utilizing our real-time messaging, you agree to be fully bound by these Terms.
            </p>
          </div>

          {/* Table of Contents */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">TABLE OF CONTENTS</h2>
            <ol className="space-y-2 text-sm font-semibold text-indigo-600 list-decimal list-inside">
              <li><a href="#acceptance" className="hover:underline">ACCEPTANCE OF TERMS & ELIGIBILITY</a></li>
              <li><a href="#accounts" className="hover:underline">ACCOUNT CREATION & SECURITY</a></li>
              <li><a href="#verification" className="hover:underline">IDENTITY & AFFILIATION VERIFICATION</a></li>
              <li><a href="#conduct" className="hover:underline">USER CONDUCT & MESSAGING RULES</a></li>
              <li><a href="#maps" className="hover:underline">GEOLOCATION & DISCOVERY MAPS</a></li>
              <li><a href="#ip" className="hover:underline">INTELLECTUAL PROPERTY & CONTENT LICENSING</a></li>
              <li><a href="#termination" className="hover:underline">ACCOUNT SUSPENSION & PERMANENT DELETION</a></li>
              <li><a href="#disclaimers" className="hover:underline">DISCLAIMER OF WARRANTIES</a></li>
              <li><a href="#liability" className="hover:underline">LIMITATION OF LIABILITY</a></li>
              <li><a href="#law" className="hover:underline">GOVERNING LAW & JURISDICTION</a></li>
              <li><a href="#disputes" className="hover:underline">DISPUTE RESOLUTION</a></li>
              <li><a href="#contact" className="hover:underline">CONTACT AND SUPPORT INFORMATION</a></li>
            </ol>
          </div>

          <hr className="border-slate-100" />

          {/* Detailed Sections */}
          <div className="space-y-12">
            
            {/* Section 1 */}
            <section id="acceptance" className="scroll-mt-6">
              <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">1. ACCEPTANCE OF TERMS & ELIGIBILITY</h2>
              <p>By creating an account, you represent and warrant that:</p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li>You are at least 18 years of age.</li>
                <li>You possess the legal authority to enter into a binding contract under applicable law.</li>
                <li>You have not been convicted of any cognizable criminal offence under Indian law, particularly offences of a sexual or violent nature.</li>
                <li>You will fully comply with these Terms and all applicable local, state, national, and international laws.</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section id="accounts" className="scroll-mt-6">
              <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">2. ACCOUNT CREATION & SECURITY</h2>
              <p>To use most features of Clique, you must register a unique account. You agree to:</p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li>Provide accurate, complete, and truthful profile data (including DOB, height, religion, prompts, and photos).</li>
                <li>Keep your credentials (login email, password, and secure OTP tokens) completely confidential.</li>
                <li>Maintain only one active profile on the platform.</li>
                <li>Immediately notify support if you suspect any unauthorized access to your account.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="verification" className="scroll-mt-6">
              <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">3. IDENTITY & AFFILIATION VERIFICATION</h2>
              <p>Clique prioritizes authentic connections through its verification protocols:</p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li><strong>Academic/Professional Affiliation</strong>: Users verifying via corporate or university emails (.edu) must own and have active rights to the respective inbox.</li>
                <li><strong>Photo ID & Selfie Verification</strong>: By uploading a selfie and an ID card, you grant Clique's administrative team permissions to compare these details manually.</li>
                <li><strong>Disclaimer</strong>: Verification statuses (Verified Badge) verify that identity or institution affiliation has been confirmed against submitted materials. Clique does not perform criminal background checks or character screens. You agree to always prioritize your personal safety when meeting people in the real world.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="conduct" className="scroll-mt-6">
              <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">4. USER CONDUCT & MESSAGING RULES</h2>
              <p>You are solely responsible for all content, chats, and actions on Clique. You agree NOT to:</p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li>Transmit any hate speech, violence, harassment, catfishing, or bullying.</li>
                <li>Create spam, automated bot scripts, commercial promotions, or unsolicited sales links.</li>
                <li>Upload sexually explicit, obscene, or highly offensive material.</li>
                <li>Impersonate any other individual or state false affiliations.</li>
                <li>Transgress the privacy rights of other members by sharing private messages or photos outside the app without consent.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section id="maps" className="scroll-mt-6">
              <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">5. GEOLOCATION & DISCOVERY MAPS</h2>
              <p>Clique features interactive location tools to show active members near you:</p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li>Your approximate location (based on IP or GPS coordinates) will be stored securely to populate matching parameters.</li>
                <li>You may toggle discovery parameters or hide your visibility on the nearby discovery map inside your profile settings at any time.</li>
                <li>Clique does not continuously track your device's location in the background when the application is closed.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section id="ip" className="scroll-mt-6">
              <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">6. INTELLECTUAL PROPERTY & CONTENT LICENSING</h2>
              <p>Ownership of uploaded material remains yours:</p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li>By uploading photos, prompts, or text, you grant Clique a non-exclusive, royalty-free, worldwide license to host, display, and distribute this material purely to operate the service.</li>
                <li>Clique retains full ownership of its trademarks, logos, custom graphics, and codebase. You agree not to copy, reverse-engineer, or scrape any part of Clique.</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section id="termination" className="scroll-mt-6">
              <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">7. ACCOUNT SUSPENSION & PERMANENT DELETION</h2>
              <p>Account status and deletion guidelines:</p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li>We reserve the right to suspend or permanently ban any user account that violates our safety guidelines or conduct policies without notice.</li>
                <li><strong>Self-Service Deletion</strong>: You can permanently delete your account at any time via your **Settings**. Deletion permanently purges your entire record, message history, and verification files from our databases, and automatically instructs Cloudinary to delete all of your uploaded photos.</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section id="disclaimers" className="scroll-mt-6">
              <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">8. DISCLAIMER OF WARRANTIES</h2>
              <p>The Clique service is provided entirely <strong>"as is"</strong> and <strong>"as available"</strong> without warranties of any kind, whether express or implied. We do not guarantee that the service will be uninterrupted, error-free, completely secure, or that any matches will be compatible.</p>
            </section>

            {/* Section 9 */}
            <section id="liability" className="scroll-mt-6">
              <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">9. LIMITATION OF LIABILITY</h2>
              <p>To the maximum extent permitted by applicable law, in no event will Clique, its founders, affiliates, or administrators be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, goodwill, or other intangible losses arising from your use of the services, interactions with other users, or conduct in the real world.</p>
            </section>

            {/* Section 10 */}
            <section id="law" className="scroll-mt-6">
              <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">10. GOVERNING LAW & JURISDICTION</h2>
              <p>These Terms, your relationship with Clique, and any dispute arising out of your use of the services shall be governed exclusively by the laws of <strong>India</strong> (and the State of <strong>Rajasthan</strong>), without regard to its conflict of law principles. You agree to submit to the personal and exclusive jurisdiction of the courts located within <strong>Udaipur, Rajasthan</strong> to resolve any legal matters.</p>
            </section>

            {/* Section 11 */}
            <section id="disputes" className="scroll-mt-6">
              <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">11. DISPUTE RESOLUTION</h2>
              <p>In the event of any dispute, both parties agree to first attempt resolution via informal negotiation by emailing <a href="mailto:clique.social.vc@gmail.com" className="text-indigo-600 hover:underline">clique.social.vc@gmail.com</a>. If unresolved within 30 days, disputes shall be referred to binding arbitration under the Indian Arbitration and Conciliation Act, 1996, with the seat of arbitration being Udaipur, Rajasthan.</p>
            </section>

            {/* Section 12 */}
            <section id="contact" className="scroll-mt-6">
              <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">12. CONTACT AND SUPPORT INFORMATION</h2>
              <p>If you have any questions, concerns, or legal notices regarding these Terms, please contact us at:</p>
              <p className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm text-slate-600 font-mono">
                Clique Legal Team<br />
                Email: <a href="mailto:clique.social.vc@gmail.com" className="text-indigo-600 hover:underline">clique.social.vc@gmail.com</a><br />
                Address: Udaipur, Rajasthan, India
              </p>
            </section>

          </div>

        </div>
      </div>
    </div>
  );
}
