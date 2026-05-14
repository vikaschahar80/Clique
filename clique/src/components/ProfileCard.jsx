
import { useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Briefcase, GraduationCap, Heart, X, Info } from 'lucide-react';
import { Badge } from './ui/badge';

export function ProfileCard({ profile, onLike, onPass }) {
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    const nextPhoto = () => {
        setCurrentPhotoIndex((prev) =>
            prev === profile.photos.length - 1 ? 0 : prev + 1
        );
    };

    const prevPhoto = () => {
        setCurrentPhotoIndex((prev) =>
            prev === 0 ? profile.photos.length - 1 : prev - 1
        );
    };

    return (
        <div className="w-full max-w-2xl mx-auto select-none">
            {/* Photo Gallery */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-6 bg-slate-900">
                <div className="aspect-[3/4] relative">
                    <img
                        src={profile.photos[currentPhotoIndex]}
                        alt={`${profile.name} - Photo ${currentPhotoIndex + 1}`}
                        className="w-full h-full object-cover"
                    />

                    {/* Photo Navigation Dots */}
                    <div className="absolute top-4 left-0 right-0 flex justify-center gap-1.5 px-4 z-10">
                        {profile.photos.map((_, index) => (
                            <div
                                key={index}
                                className={`h-1 flex-1 rounded-full transition-all ${index === currentPhotoIndex
                                        ? 'bg-white'
                                        : 'bg-white/40'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Photo Navigation Buttons - Only show if multiple photos */}
                    {profile.photos.length > 1 && (
                        <>
                            {/* Left Click Area */}
                            <div
                                className="absolute inset-y-0 left-0 w-1/2 cursor-pointer z-0"
                                onClick={prevPhoto}
                            ></div>

                            {/* Right Click Area */}
                            <div
                                className="absolute inset-y-0 right-0 w-1/2 cursor-pointer z-0"
                                onClick={nextPhoto}
                            ></div>
                        </>
                    )}

                    {/* Basic Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 pt-20 pointer-events-none">
                        <div className="flex items-center gap-2 mb-2">
                            <h2 className="text-white text-3xl font-bold">{profile.name}, {profile.age}</h2>
                            {profile.verificationStatus?.personVerified && (
                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center" title="Verified Person">
                                    <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            {profile.work && (
                                <div className="flex items-center gap-2 text-white/90">
                                    <Briefcase className="w-4 h-4" />
                                    <span className="font-medium">{profile.work}</span>
                                    {profile.verificationStatus?.workVerified && (
                                        <span className="text-blue-400">✓</span>
                                    )}
                                </div>
                            )}
                            {profile.college && (
                                <div className="flex items-center gap-2 text-white/90">
                                    <GraduationCap className="w-4 h-4" />
                                    <span className="font-medium">{profile.college}</span>
                                    {profile.verificationStatus?.collegeVerified && (
                                        <span className="text-blue-400">✓</span>
                                    )}
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-white/90">
                                <MapPin className="w-4 h-4" />
                                <span className="font-medium">{profile.location.currentCity}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center items-center gap-6 mb-8">
                <button
                    onClick={onPass}
                    className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform border-2 border-gray-200 hover:border-red-300 hover:shadow-red-200"
                    title="Pass"
                >
                    <X className="w-8 h-8 text-red-500" />
                </button>
                <button
                    onClick={() => onLike('FRIENDSHIP')}
                    className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform hover:shadow-orange-300"
                    title="Like as Friend"
                >
                    <span className="text-2xl">🤝</span>
                </button>
                <button
                    onClick={() => onLike('DATING')}
                    className="w-20 h-20 bg-gradient-to-br from-pink-500 to-red-500 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform hover:shadow-pink-300"
                    title="Like for Dating"
                >
                    <Heart className="w-10 h-10 text-white fill-white" />
                </button>
            </div>

            {/* Profile Details Below Photos */}
            <div className="space-y-6">
                {/* About Me */}
                {profile.aboutMe && (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-1 h-8 bg-gradient-to-b from-pink-500 to-purple-500 rounded-full"></div>
                            <h3 className="text-lg font-bold text-slate-900">About Me</h3>
                        </div>
                        <p className="text-slate-600 leading-relaxed text-lg">{profile.aboutMe}</p>
                        {profile.bio && (
                            <div className="mt-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-5 border border-pink-100">
                                <p className="text-center italic text-lg text-slate-700">"{profile.bio}"</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Interests */}
                {profile.interests && profile.interests.length > 0 && (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
                            <h3 className="text-lg font-bold text-slate-900">My Interests</h3>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {profile.interests.map((interest, index) => (
                                <Badge key={index} variant="secondary" className="rounded-full px-5 py-2.5 text-base hover:scale-105 transition-transform bg-slate-100 text-slate-700 hover:bg-slate-200">
                                    {interest}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* First Prompt */}
                {profile.prompts && profile.prompts[0] && (
                    <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl shadow-lg p-8 text-white">
                        <p className="text-sm font-medium opacity-90 mb-3 uppercase tracking-wide">{profile.prompts[0].question}</p>
                        <p className="text-2xl font-bold leading-relaxed">"{profile.prompts[0].answer}"</p>
                    </div>
                )}

                {/* Looking For */}
                {profile.preferences?.goal && (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-1 h-8 bg-gradient-to-b from-rose-500 to-pink-500 rounded-full"></div>
                            <h3 className="text-lg font-bold text-slate-900">I'm Looking For</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="rounded-full text-lg px-8 py-3 border-2 border-pink-100 text-pink-600 bg-pink-50">
                                {profile.preferences.goal}
                            </Badge>
                        </div>
                    </div>
                )}

                {/* Second Prompt */}
                {profile.prompts && profile.prompts[1] && (
                    <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl shadow-lg p-8 text-white">
                        <p className="text-sm font-medium opacity-90 mb-3 uppercase tracking-wide">{profile.prompts[1].question}</p>
                        <p className="text-2xl font-bold leading-relaxed">"{profile.prompts[1].answer}"</p>
                    </div>
                )}

                {/* Important Information */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-8 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full"></div>
                        <h3 className="text-lg font-bold text-slate-900">The Essentials</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { label: "Height", value: profile.height },
                            { label: "Lives In", value: profile.location.currentCity },
                            { label: "From", value: profile.location.hometown },
                            { label: "Ethnicity", value: profile.demographics.ethnicity },
                            { label: "Religion", value: profile.demographics.religion },
                            { label: "Sexuality", value: profile.demographics.sexuality },
                            { label: "Children", value: profile.demographics.children },
                            { label: "Family Plans", value: profile.demographics.familyPlan }
                        ].map((item, i) => (
                            item.value ? (
                                <div key={i} className="group hover:bg-slate-50 transition-colors rounded-2xl p-5 border border-slate-100">
                                    <p className="text-xs uppercase tracking-wider text-slate-400 mb-1 font-bold">{item.label}</p>
                                    <p className="text-lg font-medium text-slate-800">{item.value}</p>
                                </div>
                            ) : null
                        ))}
                    </div>
                </div>

                {/* Third Prompt */}
                {profile.prompts && profile.prompts[2] && (
                    <div className="bg-gradient-to-br from-orange-500 to-pink-500 rounded-3xl shadow-lg p-8 text-white">
                        <p className="text-sm font-medium opacity-90 mb-3 uppercase tracking-wide">{profile.prompts[2].question}</p>
                        <p className="text-2xl font-bold leading-relaxed">"{profile.prompts[2].answer}"</p>
                    </div>
                )}

                {/* Lifestyle */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
                        <h3 className="text-lg font-bold text-slate-900">My Lifestyle</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {profile.lifestyle.drinking && (
                            <div className="text-center group hover:bg-slate-50 transition-colors rounded-2xl p-4 border border-slate-100">
                                <div className="text-3xl mb-2">🍷</div>
                                <p className="text-xs uppercase tracking-wider text-slate-400 mb-1 font-bold">Drinking</p>
                                <p className="text-slate-800 font-medium">{profile.lifestyle.drinking}</p>
                            </div>
                        )}
                        {profile.lifestyle.smoking && (
                            <div className="text-center group hover:bg-slate-50 transition-colors rounded-2xl p-4 border border-slate-100">
                                <div className="text-3xl mb-2">🚭</div>
                                <p className="text-xs uppercase tracking-wider text-slate-400 mb-1 font-bold">Smoking</p>
                                <p className="text-slate-800 font-medium">{profile.lifestyle.smoking}</p>
                            </div>
                        )}
                        {profile.lifestyle.drugs && (
                            <div className="text-center group hover:bg-slate-50 transition-colors rounded-2xl p-4 border border-slate-100">
                                <div className="text-3xl mb-2">🌿</div>
                                <p className="text-xs uppercase tracking-wider text-slate-400 mb-1 font-bold">Drugs</p>
                                <p className="text-slate-800 font-medium">{profile.lifestyle.drugs}</p>
                            </div>
                        )}
                        {profile.lifestyle.exercise && (
                            <div className="text-center group hover:bg-slate-50 transition-colors rounded-2xl p-4 border border-slate-100">
                                <div className="text-3xl mb-2">💪</div>
                                <p className="text-xs uppercase tracking-wider text-slate-400 mb-1 font-bold">Exercise</p>
                                <p className="text-slate-800 font-medium">{profile.lifestyle.exercise}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
