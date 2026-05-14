import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Shield, Camera, Heart, Briefcase, GraduationCap, MapPin, Cake, Ruler, CheckCircle2, Upload, X, Users, Calendar, ArrowLeft, Save, Loader2, User, FileText, Coffee, Settings, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import api from "../lib/axios";
import { LocationAutocomplete } from "./LocationAutocomplete";

export function EditProfile() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // --- State Management (Initialized with defaults) ---
  const [basicInfo, setBasicInfo] = useState({
    dob: "",
    gender: "",
    location: "",
    city: "",
    country: "",
    latitude: null,
    longitude: null,
    hometown: "",
    ethnicity: "",
    religion: "",
    sexuality: "",
    height: "",
    countryCode: "+1",
    phoneNumber: ""
  });

  const [workEd, setWorkEd] = useState({
    college: "",
    work: ""
  });

  const [family, setFamily] = useState({
    children: "",
    familyPlan: ""
  });

  const [identity, setIdentity] = useState({
    preferredName: "",
    identityMode: "real-name",
    aliasExpiry: "",
    verificationType: "govt-id"
  });

  const [photos, setPhotos] = useState([]);

  const [bioData, setBioData] = useState({
    aboutMe: "",
    bio: "",
    prompts: {
      prompt1Question: "",
      prompt1Answer: "",
      prompt2Question: "",
      prompt2Answer: "",
      prompt3Question: "",
      prompt3Answer: ""
    }
  });

  const [lifestyle, setLifestyle] = useState({
    drinking: "",
    smoking: "",
    drugs: "",
    exercise: "",
    datingGoal: "",
    languages: [],
    pets: []
  });

  const [interests, setInterests] = useState([]);

  const [preferences, setPreferences] = useState({
    interestedInGender: [],
    ageRange: { min: "18", max: "35" },
    maxDistance: "50",
    whoCanMessage: "anyone"
  });

  // --- Fetch Data ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/api/profile/me");
        if (response.data.success) {
          const { user } = response.data;
          const { profile, preferences: dbPrefs } = user;

          if (profile) {
            let pNumber = profile.phoneNumber || "";
            let pCode = "+1";
            for (const c of ["+44", "+91", "+61", "+81", "+49", "+33"]) {
              if (pNumber.startsWith(c)) {
                pCode = c;
                pNumber = pNumber.slice(c.length);
                break;
              }
            }
            if (pNumber.startsWith("+1") && pCode === "+1") pNumber = pNumber.slice(2);

            setBasicInfo({
              dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : "",
              gender: profile.gender || "",
              location: profile.location || "",
              city: profile.city || "",
              country: profile.country || "",
              latitude: profile.latitude || null,
              longitude: profile.longitude || null,
              hometown: profile.hometown || "",
              ethnicity: profile.ethnicity || "",
              religion: profile.religion || "",
              sexuality: profile.sexuality || "",
              height: profile.height || "",
              countryCode: pCode,
              phoneNumber: pNumber
            });

            setWorkEd({
              college: profile.college || "",
              work: profile.work || ""
            });

            setFamily({
              children: profile.children || "",
              familyPlan: profile.familyPlan || ""
            });

            setIdentity({
              preferredName: profile.preferredName || user.fullName || "",
              identityMode: profile.identityMode || "real-name",
              aliasExpiry: profile.aliasExpiry || "",
              verificationType: profile.isCollegeVerified ? 'college-id' : profile.isWorkVerified ? 'work-id' : 'govt-id'
            });

            setPhotos(profile.photos && Array.isArray(profile.photos) ? profile.photos : []);

            setBioData({
              aboutMe: profile.aboutMe || "",
              bio: profile.bio || "",
              prompts: {
                prompt1Question: profile.prompt1Question || "",
                prompt1Answer: profile.prompt1Answer || "",
                prompt2Question: profile.prompt2Question || "",
                prompt2Answer: profile.prompt2Answer || "",
                prompt3Question: profile.prompt3Question || "",
                prompt3Answer: profile.prompt3Answer || ""
              }
            });

            setLifestyle({
              drinking: profile.drinking?.toLowerCase() || "",
              smoking: profile.smoking?.toLowerCase() || "",
              drugs: profile.drugs?.toLowerCase() || "",
              exercise: profile.exercise?.toLowerCase() || "",
              datingGoal: profile.datingGoal?.toLowerCase() || "",
              languages: Array.isArray(profile.language) ? profile.language : [],
              pets: Array.isArray(profile.pets) ? profile.pets : []
            });

            setInterests(Array.isArray(profile.interests) ? profile.interests : []);
          } else {
            // Fallback if no profile exists yet
            setIdentity(prev => ({ ...prev, preferredName: user.fullName || "" }));
          }

          if (dbPrefs) {
            setPreferences({
              interestedInGender: dbPrefs.interestedInGender || [],
              ageRange: { 
                min: dbPrefs.ageRangeMin?.toString() || "18", 
                max: dbPrefs.ageRangeMax?.toString() || "35" 
              },
              maxDistance: dbPrefs.maxDistance?.toString() || "50",
              whoCanMessage: dbPrefs.whoCanMessage || "anyone"
            });
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // --- Handlers (Reused from ProfileSetup) ---
  const updateBasic = (field, value) => setBasicInfo(prev => ({ ...prev, [field]: value }));
  const handleLocationSelect = (field, locationObj) => {
    if (!locationObj) {
      updateBasic(field, "");
      if (field === 'location') {
        setBasicInfo(prev => ({ ...prev, city: "", country: "", latitude: null, longitude: null }));
      }
      return;
    }
    updateBasic(field, locationObj.name);
    if (field === 'location') {
      setBasicInfo(prev => ({
        ...prev,
        city: locationObj.city,
        country: locationObj.country,
        latitude: locationObj.lat,
        longitude: locationObj.lon
      }));
    }
  };
  const updateWorkEd = (field, value) => setWorkEd(prev => ({ ...prev, [field]: value }));
  const updateFamily = (field, value) => setFamily(prev => ({ ...prev, [field]: value }));
  const updateIdentity = (field, value) => setIdentity(prev => ({ ...prev, [field]: value }));
  const updateBio = (field, value) => setBioData(prev => ({ ...prev, [field]: value }));
  const updatePrompt = (key, value) => setBioData(prev => ({ ...prev, prompts: { ...prev.prompts, [key]: value } }));
  const updateLifestyle = (field, value) => setLifestyle(prev => ({ ...prev, [field]: value }));
  const updatePreferences = (field, value) => setPreferences(prev => ({ ...prev, [field]: value }));
  const updateNestedPreferences = (parent, field, value) => setPreferences(prev => ({ ...prev, [parent]: { ...prev[parent], [field]: value } }));

  const toggleArrayItem = (setter, currentArray, item, max) => {
    if (currentArray.includes(item)) {
      setter(currentArray.filter(i => i !== item));
    } else {
      if (!max || currentArray.length < max) {
        setter([...currentArray, item]);
      } else {
        toast.error(`Max ${max} items allowed`);
      }
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    try {
      const response = await api.post("/api/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      if (response.data.success) {
        setPhotos(prev => [...prev, response.data.url]);
        toast.success("Photo uploaded!");
      }
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const payload = {
      ...basicInfo,
      phoneNumber: basicInfo.countryCode + basicInfo.phoneNumber,
      ...workEd,
      ...family,
      ...identity,
      photos,
      ...bioData,
      ...lifestyle,
      interests,
      ...preferences
    };

    try {
      await api.post('/api/profile/complete', payload);
      toast.success("Profile updated successfully!");
      navigate('/dashboard');
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Options ---
  const genderOptions = ["male", "female", "non-binary", "other"];
  const lifestyleFreq = ["never", "sometimes", "often", "regularly", "prefer-not-to-say"];
  const drugFreq = ["never", "sometimes", "often", "prefer-not-to-say"];
  const relationshipGoals = [
    { value: "life-partner", label: "Life Partner" },
    { value: "long-term", label: "Long Term" },
    { value: "long-term-open", label: "Long Term, Open to Short" },
    { value: "short-term-open", label: "Short Term, Open to Long" },
    { value: "figuring-out", label: "Figuring Out" },
    { value: "friendship", label: "Friendship" },
    { value: "casual", label: "Casual" },
    { value: "prefer-not-to-say", label: "Prefer not to say" }
  ];
  const religionOptions = ["Agnostic", "Atheist", "Buddhist", "Catholic", "Christian", "Hindu", "Jewish", "Muslim", "Spiritual", "Other", "Prefer not to say"];
  const ethnicityOptions = ["Asian", "Black/African descent", "East Asian", "Hispanic/Latino", "Middle Eastern", "Native American", "Pacific Islander", "South Asian", "White/Caucasian", "Other", "Prefer not to say"];
  const childrenOptions = ["Don't have children", "Have children", "Prefer not to say"];
  const familyPlanOptions = ["Want children", "Don't want children", "Not sure yet", "Prefer not to say"];
  const countryCodes = [
    { code: "+1", label: "US/CA (+1)" },
    { code: "+44", label: "UK (+44)" },
    { code: "+91", label: "IN (+91)" },
    { code: "+61", label: "AU (+61)" },
    { code: "+81", label: "JP (+81)" },
    { code: "+49", label: "DE (+49)" },
    { code: "+33", label: "FR (+33)" }
  ];

  const promptCategories = [
    {
      name: "The Real Me",
      prompts: [
        "Two truths and a lie", "My ideal Sunday looks like", "My biggest flex is", "A shower thought I recently had", "The dorkiest thing about me is", "My most controversial opinion is", "I geek out on", "My simple pleasures", "The way to win me over is", "A random fact I love is"
      ]
    },
    {
      name: "Vibe Check",
      prompts: [
        "I'm looking for someone who", "The key to my heart is", "The best way to ask me out is", "Green flags I look for", "All I ask is that you", "I'll fall for you if", "We're the same type of weird if", "My love language is", "You should *not* go out with me if", "To me, romance is"
      ]
    },
    {
      name: "Story Time",
      prompts: [
        "I know the best spot in town for", "My go-to karaoke song is", "I recently discovered that", "I won't shut up about", "My hidden talent is", "The best travel story I have is", "My worst roommate story", "A life lesson I learned the hard way", "The most spontaneous thing I've done", "My childhood crush was"
      ]
    },
    {
      name: "Deep Thoughts",
      prompts: [
        "A boundary I'm trying to set", "Therapy recently taught me", "My biggest fear is", "What I order for my last meal", "If I could have any superpower", "The meaning of life is", "Something I've changed my mind about", "The best advice I ever received", "A cause I deeply care about"
      ]
    },
    {
      name: "Let's Debate",
      prompts: [
        "Pineapple on pizza is", "The correct way to load a dishwasher", "Is a hotdog a sandwich?", "Best streaming service", "Cats vs Dogs", "Morning person or night owl", "The worst fashion trend is"
      ]
    },
    {
      name: "Dating Dealbreakers",
      prompts: [
        "My biggest pet peeve is", "I can't stand it when", "A red flag to me is", "We won't get along if", "The fastest way to lose my interest is"
      ]
    }
  ];
  const availableInterests = ["Fitness", "Travel", "Music", "Movies", "Tech", "Sports", "Food", "Art", "Photography", "Reading", "Gaming", "Dancing", "Cooking", "Fashion", "Nature", "Yoga", "Writing", "Adventure"];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 py-8 px-4 sm:px-6 lg:px-8 flex justify-center pb-24 font-sans text-slate-800">
      <div className="w-full max-w-4xl space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white/60 backdrop-blur-md p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-100">
          <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2 hover:bg-slate-100/50 text-slate-600 rounded-xl transition-all self-start sm:self-auto">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-600 font-clash tracking-tight text-center">Edit Profile</h1>
          <Button onClick={handleSave} disabled={isSaving} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all border-0 self-stretch sm:self-auto py-6 sm:py-2">
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
            Save Changes
          </Button>
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
            <TabsList className="flex inline-flex min-w-max h-auto gap-2 bg-white/50 backdrop-blur-sm p-2 mb-2 rounded-2xl border border-slate-200/60 shadow-sm">
              {[
                { val: "basic", label: "Basic", icon: <User className="w-4 h-4 mr-2" /> },
                { val: "identity", label: "Identity", icon: <Shield className="w-4 h-4 mr-2" /> },
                { val: "photos", label: "Photos", icon: <Camera className="w-4 h-4 mr-2" /> },
                { val: "bio", label: "Bio", icon: <FileText className="w-4 h-4 mr-2" /> },
                { val: "work", label: "Work/Ed", icon: <Briefcase className="w-4 h-4 mr-2" /> },
                { val: "lifestyle", label: "Lifestyle", icon: <Coffee className="w-4 h-4 mr-2" /> },
                { val: "interests", label: "Interests", icon: <Heart className="w-4 h-4 mr-2" /> },
                { val: "prefs", label: "Prefs", icon: <Settings className="w-4 h-4 mr-2" /> },
              ].map((tab) => (
                <TabsTrigger 
                  key={tab.val} 
                  value={tab.val} 
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md border border-transparent data-[state=active]:border-slate-100 rounded-xl px-5 py-3 text-sm font-semibold text-slate-500 transition-all hover:text-slate-700 flex items-center"
                >
                  {tab.icon}
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <Card className="border-0 shadow-xl shadow-slate-200/40 rounded-3xl bg-white/80 backdrop-blur-xl overflow-hidden">
            <CardContent className="p-6 sm:p-10">
              <TabsContent value="basic" className="space-y-4 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-slate-700 font-semibold">Phone Number</Label>
                    <div className="flex gap-2">
                      <select className="p-3 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all w-1/3 text-sm" value={basicInfo.countryCode} onChange={e => updateBasic('countryCode', e.target.value)}>
                        {countryCodes.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                      </select>
                      <Input className="rounded-xl border-slate-200 focus-visible:ring-cyan-500/30 w-2/3" value={basicInfo.phoneNumber} onChange={e => updateBasic('phoneNumber', e.target.value)} placeholder="Phone number" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-slate-700 font-semibold">Date of Birth</Label>
                    <Input className="rounded-xl border-slate-200 focus-visible:ring-cyan-500/30" type="date" value={basicInfo.dob} onChange={e => updateBasic('dob', e.target.value)} />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-slate-700 font-semibold">Gender</Label>
                    <select className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all" value={basicInfo.gender} onChange={e => updateBasic('gender', e.target.value)}>
                      <option value="">Select</option>
                      {genderOptions.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-slate-700 font-semibold">Height (cm)</Label>
                    <Input className="rounded-xl border-slate-200 focus-visible:ring-cyan-500/30" type="number" value={basicInfo.height} onChange={e => updateBasic('height', e.target.value)} />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-slate-700 font-semibold">Location (City)</Label>
                    <div className="rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-cyan-500/30 border border-slate-200">
                      <LocationAutocomplete value={basicInfo.location} onLocationSelect={(loc) => handleLocationSelect('location', loc)} placeholder="Search your city..." />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-slate-700 font-semibold">Hometown</Label>
                    <div className="rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-cyan-500/30 border border-slate-200">
                      <LocationAutocomplete value={basicInfo.hometown} onLocationSelect={(loc) => handleLocationSelect('hometown', loc)} placeholder="Search your hometown..." />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-slate-700 font-semibold">Ethnicity</Label>
                    <select className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all" value={basicInfo.ethnicity} onChange={e => updateBasic('ethnicity', e.target.value)}>
                      <option value="">Select</option>
                      {ethnicityOptions.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-slate-700 font-semibold">Religion</Label>
                    <select className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all" value={basicInfo.religion} onChange={e => updateBasic('religion', e.target.value)}>
                      <option value="">Select</option>
                      {religionOptions.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="identity" className="space-y-6 mt-0">
                <div className="space-y-3">
                  <Label className="text-slate-700 font-semibold">Preferred Name</Label>
                  <Input className="rounded-xl border-slate-200 focus-visible:ring-cyan-500/30" value={identity.preferredName} onChange={e => updateIdentity('preferredName', e.target.value)} />
                </div>
                <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                  <Label className="text-slate-700 font-semibold">Identity Mode</Label>
                  <RadioGroup className="flex flex-col sm:flex-row gap-4" value={identity.identityMode} onValueChange={v => updateIdentity('identityMode', v)}>
                    <div className="flex items-center space-x-2 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm"><RadioGroupItem value="real-name" id="mode1" /><Label htmlFor="mode1" className="cursor-pointer font-medium">Real Name</Label></div>
                    <div className="flex items-center space-x-2 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm"><RadioGroupItem value="pseudonym" id="mode2" /><Label htmlFor="mode2" className="cursor-pointer font-medium">Pseudonym</Label></div>
                    <div className="flex items-center space-x-2 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm"><RadioGroupItem value="temporary" id="mode3" /><Label htmlFor="mode3" className="cursor-pointer font-medium">Temporary</Label></div>
                  </RadioGroup>
                </div>
                <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                  <Label className="text-slate-700 font-semibold">Verification Method</Label>
                  <RadioGroup className="flex flex-col sm:flex-row gap-4" value={identity.verificationType} onValueChange={v => updateIdentity('verificationType', v)}>
                    <div className="flex items-center space-x-2 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm"><RadioGroupItem value="govt-id" id="v1" /><Label htmlFor="v1" className="cursor-pointer font-medium">Govt ID</Label></div>
                    <div className="flex items-center space-x-2 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm"><RadioGroupItem value="college-id" id="v2" /><Label htmlFor="v2" className="cursor-pointer font-medium">College ID</Label></div>
                    <div className="flex items-center space-x-2 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm"><RadioGroupItem value="work-id" id="v3" /><Label htmlFor="v3" className="cursor-pointer font-medium">Work ID</Label></div>
                  </RadioGroup>
                </div>
              </TabsContent>

              <TabsContent value="photos" className="space-y-6 mt-0">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {photos.map((url, i) => (
                    <div key={i} className="aspect-[3/4] bg-slate-100 rounded-2xl shadow-sm border-2 border-transparent relative overflow-hidden group hover:border-cyan-400 transition-all hover:shadow-md">
                      <img src={url} alt="Profile" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <button onClick={() => setPhotos(photos.filter(p => p !== url))} className="absolute top-3 right-3 bg-white/90 text-red-500 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:scale-110 shadow-sm">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {photos.length < 6 && (
                    <button onClick={() => fileInputRef.current.click()} disabled={isUploading} className="aspect-[3/4] border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center hover:bg-cyan-50 hover:border-cyan-300 transition-all group shadow-sm bg-white/50">
                      <div className="p-4 rounded-full bg-slate-100 group-hover:bg-cyan-100 transition-colors">
                        {isUploading ? <Loader2 className="w-8 h-8 animate-spin text-cyan-600" /> : <Upload className="w-8 h-8 text-cyan-500" />}
                      </div>
                      <span className="text-sm font-medium mt-4 text-slate-600 group-hover:text-cyan-700">Upload Photo</span>
                    </button>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="bio" className="space-y-6 mt-0">
                <div className="space-y-3">
                  <Label className="text-slate-700 font-semibold">About Me</Label>
                  <Textarea className="min-h-[120px] rounded-xl border-slate-200 focus-visible:ring-cyan-500/30 resize-none" value={bioData.aboutMe} onChange={e => updateBio('aboutMe', e.target.value)} placeholder="Write a bit about yourself..." />
                </div>
                <div className="space-y-3">
                  <Label className="text-slate-700 font-semibold">Short Bio (Headline)</Label>
                  <Input className="rounded-xl border-slate-200 focus-visible:ring-cyan-500/30" value={bioData.bio} onChange={e => updateBio('bio', e.target.value)} placeholder="Your catchy tagline" />
                </div>
                <div className="space-y-6 pt-6 border-t border-slate-100">
                  <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-600">Profile Prompts</h3>
                  {['1', '2', '3'].map(num => (
                    <div key={num} className="space-y-4 p-6 border border-slate-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow relative">
                      <Label className="text-sm font-semibold text-cyan-600 uppercase tracking-wider">Prompt {num}</Label>
                      <div className="relative">
                        <select className="w-full p-3 pr-10 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all font-medium text-slate-700 appearance-none shadow-sm hover:border-cyan-300 cursor-pointer" value={bioData.prompts[`prompt${num}Question`]} onChange={e => updatePrompt(`prompt${num}Question`, e.target.value)}>
                          <option value="">Select a prompt...</option>
                          {promptCategories.map(cat => (
                            <optgroup key={cat.name} label={cat.name}>
                              {cat.prompts.map(q => (
                                <option key={q} value={q}>{q}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                      </div>
                      {bioData.prompts[`prompt${num}Question`] && (
                        <Textarea className="rounded-xl border-slate-200 focus-visible:ring-cyan-500/30 mt-2 bg-slate-50 focus:bg-white transition-colors" placeholder="Type your answer here..." value={bioData.prompts[`prompt${num}Answer`]} onChange={e => updatePrompt(`prompt${num}Answer`, e.target.value)} />
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="work" className="space-y-6 mt-0">
                <div className="space-y-3">
                  <Label className="text-slate-700 font-semibold">Job Title / Company</Label>
                  <Input className="rounded-xl border-slate-200 focus-visible:ring-cyan-500/30" value={workEd.work} onChange={e => updateWorkEd('work', e.target.value)} placeholder="e.g. Software Engineer at Google" />
                </div>
                <div className="space-y-3">
                  <Label className="text-slate-700 font-semibold">College / University</Label>
                  <Input className="rounded-xl border-slate-200 focus-visible:ring-cyan-500/30" value={workEd.college} onChange={e => updateWorkEd('college', e.target.value)} placeholder="e.g. Stanford University" />
                </div>
                <div className="pt-6 border-t border-slate-100 space-y-6">
                   <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-600">Family Plans</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-3">
                      <Label className="text-slate-700 font-semibold">Children</Label>
                      <select className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all" value={family.children} onChange={e => updateFamily('children', e.target.value)}>
                        <option value="">Select Option</option>
                        {childrenOptions.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-slate-700 font-semibold">Family Plans</Label>
                      <select className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all" value={family.familyPlan} onChange={e => updateFamily('familyPlan', e.target.value)}>
                        <option value="">Select Option</option>
                        {familyPlanOptions.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="lifestyle" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-slate-700 font-semibold">Drinking</Label>
                    <select className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all" value={lifestyle.drinking} onChange={e => updateLifestyle('drinking', e.target.value)}>
                      <option value="">Select</option>
                      {lifestyleFreq.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-slate-700 font-semibold">Smoking</Label>
                    <select className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all" value={lifestyle.smoking} onChange={e => updateLifestyle('smoking', e.target.value)}>
                      <option value="">Select</option>
                      {lifestyleFreq.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-slate-700 font-semibold">Drugs</Label>
                    <select className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all" value={lifestyle.drugs} onChange={e => updateLifestyle('drugs', e.target.value)}>
                      <option value="">Select</option>
                      {drugFreq.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-slate-700 font-semibold">Exercise</Label>
                    <select className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all" value={lifestyle.exercise} onChange={e => updateLifestyle('exercise', e.target.value)}>
                      <option value="">Select</option>
                      {lifestyleFreq.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <Label className="text-slate-700 font-semibold">Relationship Goal</Label>
                  <select className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all" value={lifestyle.datingGoal} onChange={e => updateLifestyle('datingGoal', e.target.value)}>
                    <option value="">What are you looking for?</option>
                    {relationshipGoals.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </TabsContent>

              <TabsContent value="interests" className="space-y-6 mt-0">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <p className="text-slate-500 text-sm mb-6 font-medium">Select up to 5 interests that describe you best</p>
                  <div className="flex flex-wrap gap-3">
                    {availableInterests.map(interest => (
                      <Badge 
                        key={interest} 
                        variant={interests.includes(interest) ? "default" : "outline"} 
                        className={`cursor-pointer px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105 ${
                          interests.includes(interest) 
                            ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-transparent shadow-md" 
                            : "bg-white text-slate-600 border-slate-200 hover:border-cyan-300 hover:text-cyan-700"
                        }`} 
                        onClick={() => toggleArrayItem(setInterests, interests, interest, 5)}
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="prefs" className="space-y-6 mt-0">
                <div className="space-y-8">
                  <div className="space-y-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <Label className="text-slate-700 font-semibold block">Interested In</Label>
                    <div className="flex gap-3">
                      {['men', 'women', 'everyone'].map(g => (
                        <Badge 
                          key={g} 
                          variant={preferences.interestedInGender.includes(g) ? "default" : "outline"} 
                          className={`cursor-pointer px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105 ${
                            preferences.interestedInGender.includes(g) 
                              ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-transparent shadow-md" 
                              : "bg-white text-slate-600 border-slate-200 hover:border-cyan-300 hover:text-cyan-700"
                          }`} 
                          onClick={() => toggleArrayItem(v => updatePreferences('interestedInGender', v), preferences.interestedInGender, g)}
                        >
                          {g.toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="space-y-3">
                      <Label className="text-slate-700 font-semibold">Min Age</Label>
                      <Input className="rounded-xl border-slate-200 focus-visible:ring-cyan-500/30" type="number" value={preferences.ageRange.min} onChange={e => updateNestedPreferences('ageRange', 'min', e.target.value)} />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-slate-700 font-semibold">Max Age</Label>
                      <Input className="rounded-xl border-slate-200 focus-visible:ring-cyan-500/30" type="number" value={preferences.ageRange.max} onChange={e => updateNestedPreferences('ageRange', 'max', e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-center">
                      <Label className="text-slate-700 font-semibold">Maximum Distance</Label>
                      <span className="bg-cyan-100 text-cyan-800 text-xs font-bold px-3 py-1 rounded-full">{preferences.maxDistance} km</span>
                    </div>
                    <input 
                      type="range" 
                      min="5" 
                      max="100" 
                      value={preferences.maxDistance} 
                      onChange={e => updatePreferences('maxDistance', e.target.value)} 
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-500" 
                    />
                  </div>
                </div>
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
}
