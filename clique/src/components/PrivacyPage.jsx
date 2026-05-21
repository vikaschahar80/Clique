import { Shield, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-8 font-medium text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* Premium Header */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-xl overflow-hidden relative mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-100/30 rounded-full blur-3xl -z-10" />
          
          <div className="flex items-center gap-3 px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider w-fit mb-6">
            <Shield className="w-4 h-4" /> Privacy Center
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-slate-500 font-medium">
            Last updated <span className="text-slate-800">May 20, 2026</span>
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200 shadow-xl prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-8">
          
          {/* Introductory Notice */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm md:text-base">
            <p className="m-0 font-medium text-slate-700">
              This Privacy Notice for <strong>Clique</strong> ("<strong>we</strong>," "<strong>us</strong>," or "<strong>our</strong>"), describes how and why we might access, collect, store, use, and/or share ("<strong>process</strong>") your personal information when you use our services ("<strong>Services</strong>"), including when you:
            </p>
            <ul className="mt-4 space-y-2 list-disc list-inside text-slate-600">
              <li>
                Visit our website at <a href="https://clique-social.vercel.app" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-semibold">https://clique-social.vercel.app</a> or any website of ours that links to this Privacy Notice
              </li>
              <li>
                Use <strong>Clique</strong> (Clique: Safe, Verified Real-World Connections. Where authenticity meets community. Meet verified people around you without the fear of bots, spam, or catfishing)
              </li>
              <li>
                Engage with us in other related ways, including any marketing or events
              </li>
            </ul>
            <p className="mt-4 mb-0 text-slate-500 text-xs">
              <strong>Questions or concerns?</strong> Reading this Privacy Notice will help you understand your privacy rights and choices. If you do not agree with our policies and practices, please do not use our Services. If you still have any questions or concerns, please contact us at <a href="mailto:clique.social.vc@gmail.com" className="text-blue-600 hover:underline">clique.social.vc@gmail.com</a>.
            </p>
          </div>

          <hr className="border-slate-100" />

          {/* Summary Section */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">SUMMARY OF KEY POINTS</h2>
            <p className="text-slate-500 italic mb-4">
              This summary provides key points from our Privacy Notice, but you can find out more details about any of these topics by checking our full Table of Contents below.
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="border border-slate-100 p-4 rounded-xl">
                <strong className="text-slate-800 block mb-1">What personal info do we process?</strong>
                Depending on how you use our Services, we process information you disclose (names, emails, etc.).
              </div>
              <div className="border border-slate-100 p-4 rounded-xl">
                <strong className="text-slate-800 block mb-1">Do we process sensitive info?</strong>
                We may process racial/ethnic origin, sexual orientation, religious beliefs, or student/work status with your consent.
              </div>
              <div className="border border-slate-100 p-4 rounded-xl">
                <strong className="text-slate-800 block mb-1">Do we collect third-party data?</strong>
                We do not collect any information from third-party databases.
              </div>
              <div className="border border-slate-100 p-4 rounded-xl">
                <strong className="text-slate-800 block mb-1">How do we process your info?</strong>
                Primarily to provide services, confirm identity, secure the platform, communicate, and ensure safety.
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Table of Contents */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">TABLE OF CONTENTS</h2>
            <ol className="space-y-2 text-sm font-semibold text-blue-600 list-decimal list-inside">
              <li><a href="#infocollect" className="hover:underline">WHAT INFORMATION DO WE COLLECT?</a></li>
              <li><a href="#infouse" className="hover:underline">HOW DO WE PROCESS YOUR INFORMATION?</a></li>
              <li><a href="#whoshare" className="hover:underline">WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</a></li>
              <li><a href="#3pwebsites" className="hover:underline">WHAT IS OUR STANCE ON THIRD-PARTY WEBSITES?</a></li>
              <li><a href="#cookies" className="hover:underline">DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</a></li>
              <li><a href="#sociallogins" className="hover:underline">HOW DO WE HANDLE YOUR SOCIAL LOGINS?</a></li>
              <li><a href="#inforetain" className="hover:underline">HOW LONG DO WE KEEP YOUR INFORMATION?</a></li>
              <li><a href="#privacyrights" className="hover:underline">WHAT ARE YOUR PRIVACY RIGHTS?</a></li>
              <li><a href="#DNT" className="hover:underline">CONTROLS FOR DO-NOT-TRACK FEATURES</a></li>
              <li><a href="#otherlaws" className="hover:underline">DO OTHER REGIONS HAVE SPECIFIC PRIVACY RIGHTS?</a></li>
              <li><a href="#policyupdates" className="hover:underline">DO WE MAKE UPDATES TO THIS NOTICE?</a></li>
              <li><a href="#contact" className="hover:underline">HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</a></li>
              <li><a href="#request" className="hover:underline">HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT?</a></li>
            </ol>
          </div>

          <hr className="border-slate-100" />

          {/* Detailed Sections */}
          <div className="space-y-12">
            
            {/* Section 1 */}
            <section id="infocollect" className="scroll-mt-6">
              <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">1. WHAT INFORMATION DO WE COLLECT?</h2>
              
              <h3 className="text-lg font-bold text-slate-800 mt-4 mb-2">Personal information you disclose to us</h3>
              <p>We collect personal information that you voluntarily provide to us when you register on the Services, express interest in obtaining info, participate in activities, or otherwise contact us.</p>
              
              <p className="font-semibold text-slate-700 mt-3">Personal Information Provided by You:</p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li>Names</li>
                <li>Phone numbers</li>
                <li>Email addresses</li>
                <li>Usernames and Passwords</li>
                <li>Job titles and professional work profiles</li>
              </ul>

              <h3 className="text-lg font-bold text-slate-800 mt-6 mb-2">Sensitive Information</h3>
              <p>When necessary, with your explicit consent or as otherwise permitted by applicable law, we process the following categories of sensitive information to help construct your community profile:</p>
              <ul className="list-disc list-inside pl-4 space-y-1 text-slate-600">
                <li>Data about sex life or sexual orientation</li>
                <li>Information revealing race or ethnic origin</li>
                <li>Information revealing religious or philosophical beliefs</li>
                <li>Student and university verification data</li>
                <li>Government identifiers / photo IDs (for secure manual verification)</li>
              </ul>

              <h3 className="text-lg font-bold text-slate-800 mt-6 mb-2">Social Media Login Data</h3>
              <p>We may provide you with the option to register with us using your existing social media account details, like Google, Facebook, or X. If you choose to do so, we collect name, email address, usernames, and profile picture from the provider.</p>

              <h3 className="text-lg font-bold text-slate-800 mt-6 mb-2">Information automatically collected</h3>
              <p>We automatically collect certain information when you visit, use, or navigate the Services (e.g. IP address, browser and device characteristics, operating system, location data, log and usage data, referring URLs, etc.). This information is needed to maintain platform security, optimize performance, and for internally monitoring analytics.</p>
              <p>Our use of information received from Google APIs will adhere to the Google API Services User Data Policy, including the Limited Use requirements.</p>
            </section>

            {/* Section 2 */}
            <section id="infouse" className="scroll-mt-6">
              <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">2. HOW DO WE PROCESS YOUR INFORMATION?</h2>
              <p>We process your personal information to provide, improve, secure, and administer our Services, communicate with you, ensure safety, prevent fraud, and comply with law. Key reasons include:</p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li><strong>To facilitate account creation and authentication</strong></li>
                <li><strong>To deliver and facilitate delivery of services to you</strong></li>
                <li><strong>To respond to user inquiries and offer help/support</strong></li>
                <li><strong>To send administrative information</strong></li>
                <li><strong>To enable user-to-user communications (real-time chat)</strong></li>
                <li><strong>To request feedback</strong></li>
                <li><strong>To evaluate and improve our Services, products, and user experiences</strong></li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="whoshare" className="scroll-mt-6">
              <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">3. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</h2>
              <p>We may share your data with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf and require access to such information to do that work. These include:</p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li>Data Analytics Services (to measure traffic)</li>
                <li>Cloud Computing & Storage Services (Cloudinary, Neon, MongoDB)</li>
                <li>Social Networks (if you connect your accounts)</li>
                <li>Government Entities (only if required by valid law)</li>
                <li>Website Hosting Service Providers (Vercel, Render)</li>
              </ul>
              <p className="mt-4">We also share location details with certain Google Maps Platform APIs (e.g. Places API) to show active, nearby community members, with a cache duration of up to 6 months.</p>
            </section>

            {/* Section 4 */}
            <section id="3pwebsites" className="scroll-mt-6">
              <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">4. WHAT IS OUR STANCE ON THIRD-PARTY WEBSITES?</h2>
              <p>We are not responsible for the safety of any information that you share with third parties that we may link to or who advertise on our Services, but are not affiliated with, our Services. We recommend checking their safety policies before submitting personal data.</p>
            </section>

            {/* Section 5 */}
            <section id="cookies" className="scroll-mt-6">
              <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">5. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</h2>
              <p>We may use cookies and similar tracking technologies (like web beacons and pixels) to gather or store your information. These help secure your account, prevent server crashes, fix bugs, save preferences, and assist basic website functionalities.</p>
            </section>

            {/* Section 6 */}
            <section id="sociallogins" className="scroll-mt-6">
              <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">6. HOW DO WE HANDLE YOUR SOCIAL LOGINS?</h2>
              <p>If you choose to register or log in using a third-party social media account, we may access certain details from their platform (such as your name, email address, profile picture, etc.). We will use this information only for the authentication purposes described inside this policy.</p>
            </section>

            {/* Section 7 */}
            <section id="inforetain" className="scroll-mt-6">
              <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">7. HOW LONG DO WE KEEP YOUR INFORMATION?</h2>
              <p>We will only keep your personal information for as long as it is necessary for the purposes set out in this Privacy Notice, unless a longer retention period is required or permitted by law. Primarily, we keep information only for the period of time in which you maintain an active account with us. Upon deletion request, all data is immediately purged.</p>
            </section>

            {/* Section 8 */}
            <section id="privacyrights" className="scroll-mt-6">
              <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">8. WHAT ARE YOUR PRIVACY RIGHTS?</h2>
              <p>Depending on your location, you may have specific privacy rights regarding your personal information. You can review, change, or terminate your account at any time.</p>
              
              <h3 className="text-lg font-bold text-slate-800 mt-4 mb-2">Account Information</h3>
              <p>If you would at any time like to review or change the information in your account or terminate your account, you can:</p>
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl mt-2 text-sm text-slate-700">
                <strong>Log in and head over to your Settings. Click Delete Account at the bottom of the page. Confirm your choice.</strong>
              </div>
              <p className="mt-4">Upon your request to terminate your account, we will permanently delete your account, matches, and chats from our active databases, and instantly erase all your profile pictures from Cloudinary.</p>
            </section>

            {/* Section 9 */}
            <section id="DNT" className="scroll-mt-6">
              <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">9. CONTROLS FOR DO-NOT-TRACK FEATURES</h2>
              <p>Most web browsers include a Do-Not-Track ("DNT") setting. Because there is currently no uniform industry standard for recognizing DNT signals, we do not currently respond to automated DNT browser requests.</p>
            </section>

            {/* Section 10 */}
            <section id="otherlaws" className="scroll-mt-6">
              <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">10. DO OTHER REGIONS HAVE SPECIFIC PRIVACY RIGHTS?</h2>
              <p>Depending on your country of residence, you have additional rights:</p>
              
              <h3 className="text-base font-bold text-slate-800 mt-4">India (Digital Personal Data Protection Act, 2023 - DPDP)</h3>
              <p>Under India's Digital Personal Data Protection (DPDP) Act 2023, you as a Data Principal have the following statutory rights:</p>
              <ul className="list-disc list-inside pl-4 space-y-1 mt-2 text-slate-600">
                <li><strong>Right to withdraw consent:</strong> You can withdraw your consent to data processing at any time.</li>
                <li><strong>Right to correction and erasure:</strong> You can request the correction of inaccurate data or the absolute erasure of your profile.</li>
                <li><strong>Right of grievance redressal:</strong> You can file a complaint with our Grievance Officer regarding any data processing concern.</li>
                <li><strong>Right to nominate:</strong> You can nominate another individual to exercise your rights in the event of death or incapacity.</li>
              </ul>

              <h3 className="text-base font-bold text-slate-800 mt-6">Australia and New Zealand</h3>
              <p>We process under Australia's Privacy Act 1988 and New Zealand's Privacy Act 2020. You have the right to request access to or correction of your personal data at any time.</p>
              <h3 className="text-base font-bold text-slate-800 mt-4">Republic of South Africa</h3>
              <p>Under POPIA/PAIA, you have full rights to request access, correction, or deletion of your personal records by contacting the South African Information Regulator.</p>
            </section>

            {/* Section 11 */}
            <section id="policyupdates" className="scroll-mt-6">
              <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">11. DO WE MAKE UPDATES TO THIS NOTICE?</h2>
              <p>Yes, we will update this notice from time to time as necessary to stay compliant with relevant data protection laws and technological upgrades.</p>
            </section>

            {/* Section 12 */}
            <section id="contact" className="scroll-mt-6">
              <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">12. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</h2>
              <p>If you have questions or comments about this notice, you may email us at: <a href="mailto:clique.social.vc@gmail.com" className="text-blue-600 hover:underline font-bold">clique.social.vc@gmail.com</a></p>
              
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mt-6">
                <h3 className="text-lg font-bold text-blue-900 mb-2">Grievance Officer (India DPDP Act Redressal)</h3>
                <p className="text-sm text-blue-800 mb-4">
                  In accordance with the India Digital Personal Data Protection (DPDP) Act 2023, if you have any queries, concerns, or grievances regarding the processing of your personal data, you may contact our designated Grievance Officer:
                </p>
                <div className="text-sm text-blue-900 font-semibold space-y-1 bg-white/60 p-4 rounded-xl border border-blue-100/50">
                  <div>👤 <strong>Grievance Officer:</strong> Vikash Chahar</div>
                  <div>✉️ <strong>Email:</strong> <a href="mailto:clique.social.vc@gmail.com" className="underline hover:text-blue-700">clique.social.vc@gmail.com</a></div>
                  <div>📍 <strong>Address:</strong> Electronic Redressal Cell, Clique Social, India</div>
                </div>
              </div>
            </section>

            {/* Section 13 */}
            <section id="request" className="scroll-mt-6">
              <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">13. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT?</h2>
              <p>Based on the applicable laws of your country, you have the right to request access to the personal information we collect from you, correct inaccuracies, or delete your profile. To make a request, please contact us by emailing our support desk directly at: <a href="mailto:clique.social.vc@gmail.com" className="text-blue-600 hover:underline font-bold">clique.social.vc@gmail.com</a>.</p>
            </section>

          </div>

          {/* Termly Attribution */}
          <div className="border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
            This Privacy Policy was created using Termly's <a href="https://termly.io/" target="_blank" rel="noreferrer" className="underline">Privacy Policy Generator</a>.
          </div>

        </div>
      </div>
    </div>
  );
}
