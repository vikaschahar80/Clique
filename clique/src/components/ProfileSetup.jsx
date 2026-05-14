import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Badge } from "./ui/badge";
import { Shield, Camera, Heart, Briefcase, GraduationCap, MapPin, Cake, Ruler, CheckCircle2, Upload, X, Users, Calendar, AlertTriangle, Lock, ChevronRight, ChevronLeft, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import api from "../lib/axios";
import { LocationAutocomplete } from "./LocationAutocomplete";
import logo2 from '/Images/Logo2.png'

export function ProfileSetup({ user, onComplete }) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // --- State Management ---

  // 1. Basic Info
  const [basicInfo, setBasicInfo] = useState({
    dob: "",
    gender: "",
    showGender: "yes",
    location: "",
    city: "",
    country: "",
    latitude: null,
    longitude: null,
    hometown: "",
    ethnicity: "",
    religion: "",
    sexuality: "",
    height: "", // cm
    countryCode: "+1",
    phoneNumber: ""
  });

  // 2. Education & Work
  const [workEd, setWorkEd] = useState({
    college: "",
    work: "" // Job Title / Company
  });

  // 3. Family
  const [family, setFamily] = useState({
    children: "",
    familyPlan: ""
  });

  // 4. Identity
  const [identity, setIdentity] = useState({
    preferredName: "",
    useRealName: "yes",
    identityMode: "",
    aliasExpiry: "",
    verificationType: ""
  });

  // 5. Photos
  const [photos, setPhotos] = useState([]);

  // 6. Bio & Prompts
  const [bioData, setBioData] = useState({
    aboutMe: "",
    bio: "", // Short bio
    prompts: {
      prompt1Question: "",
      prompt1Answer: "",
      prompt2Question: "",
      prompt2Answer: "",
      prompt3Question: "",
      prompt3Answer: ""
    }
  });

  // 7. Lifestyle
  const [lifestyle, setLifestyle] = useState({
    drinking: "",
    smoking: "",
    drugs: "",
    exercise: "",
    datingGoal: "",
    languages: [],
    pets: []
  });

  // 8. Interests
  const [interests, setInterests] = useState([]);

  // 9. Preferences
  const [preferences, setPreferences] = useState({
    lookingFor: [], // Relationship type
    selectedCircles: [],
    openToNearby: "yes",
    openToTravel: "yes",
    interestedInGender: [], // Men, Women, etc.
    ageRange: { min: "18", max: "35" },
    maxDistance: "50",
    whoCanMessage: "",
    allowAnonymous: "no",
    screenshotBlocking: "yes",
    autoFilter: "yes",
    emergencyAlert: "yes",
    moderatorIntervention: "yes"
  });

  // --- Enums & Options ---
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

  const availableInterests = [
    "Fitness", "Travel", "Music", "Movies", "Tech", "Sports",
    "Food", "Art", "Photography", "Reading", "Gaming", "Dancing",
    "Cooking", "Fashion", "Nature", "Yoga", "Writing", "Adventure"
  ];

  // --- Handlers ---

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

  const handleAddPhotoClick = () => {
    if (photos.length >= 6) {
      toast.error("Maximum 6 photos allowed");
      return;
    }
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("File must be an image");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await api.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.data.success) {
        setPhotos(prev => [...prev, response.data.url]);
        toast.success("Photo uploaded!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removePhoto = (urlToRemove) => {
    setPhotos(photos.filter(url => url !== urlToRemove));
  };

  const updateBio = (field, value) => setBioData(prev => ({ ...prev, [field]: value }));
  const updatePrompt = (key, field, value) => {
    setBioData(prev => ({
      ...prev,
      prompts: { ...prev.prompts, [key]: value } // e.g., prompt1Question
    }));
  };

  const updateLifestyle = (field, value) => setLifestyle(prev => ({ ...prev, [field]: value }));
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

  const updatePreferences = (field, value) => setPreferences(prev => ({ ...prev, [field]: value }));
  const updateNestedPreferences = (parent, field, value) => {
    setPreferences(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };


  // --- Validation ---
  const canProceed = () => {
    switch (step) {
      case 1: // Basic
        return basicInfo.dob && basicInfo.gender && basicInfo.location && basicInfo.phoneNumber;
      case 2: // Work/Ed
        return true; // Optional
      case 3: // Family
        return true; // Optional
      case 4: // Identity
        return identity.preferredName && identity.identityMode && identity.verificationType;
      case 5: // Photos
        return photos.length >= 2;
      case 6: // Bio
        return true; // Optional
      case 7: // Lifestyle
        return true; // Optional
      case 8: // Interests
        return interests.length >= 3;
      case 9: // Preferences
        return preferences.whoCanMessage && preferences.interestedInGender.length > 0;
      default: return false;
    }
  };


  // --- Submit ---
  const handleComplete = async () => {
    setIsLoading(true);
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
      toast.success("Profile completed! Welcome to Clique!");
      onComplete();
    } catch (error) {
      console.error("Profile completion error:", error);
      toast.error(error.response?.data?.message || "Failed to save profile.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render Steps ---
  const renderStep = () => {
    switch (step) {
      case 1: return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone Number *</Label>
              <div className="flex gap-2">
                <select className="p-2 border rounded w-1/3 text-sm" value={basicInfo.countryCode} onChange={e => updateBasic('countryCode', e.target.value)}>
                  {countryCodes.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                </select>
                <Input className="w-2/3" value={basicInfo.phoneNumber} onChange={e => updateBasic('phoneNumber', e.target.value)} placeholder="Phone number" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Date of Birth *</Label>
              <Input type="date" value={basicInfo.dob} onChange={e => updateBasic('dob', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Gender *</Label>
              <select className="w-full p-2 border rounded" value={basicInfo.gender} onChange={e => updateBasic('gender', e.target.value)}>
                <option value="">Select</option>
                {genderOptions.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Height (cm)</Label>
              <Input type="number" value={basicInfo.height} onChange={e => updateBasic('height', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Location (City) *</Label>
              <LocationAutocomplete 
                value={basicInfo.location} 
                onLocationSelect={(loc) => handleLocationSelect('location', loc)} 
                placeholder="Search your city..."
              />
            </div>
            <div className="space-y-2">
              <Label>Hometown</Label>
              <LocationAutocomplete 
                value={basicInfo.hometown} 
                onLocationSelect={(loc) => handleLocationSelect('hometown', loc)} 
                placeholder="Search your hometown..."
              />
            </div>
            <div className="space-y-2">
              <Label>Ethnicity</Label>
              <select className="w-full p-2 border rounded" value={basicInfo.ethnicity} onChange={e => updateBasic('ethnicity', e.target.value)}>
                <option value="">Select Ethnicity</option>
                {ethnicityOptions.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Religion</Label>
              <select className="w-full p-2 border rounded" value={basicInfo.religion} onChange={e => updateBasic('religion', e.target.value)}>
                <option value="">Select Religion</option>
                {religionOptions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
        </div>
      );
      case 2: return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Job Title / Company</Label>
            <Input value={workEd.work} onChange={e => updateWorkEd('work', e.target.value)} placeholder="Software Engineer at Tech Co" />
          </div>
          <div className="space-y-2">
            <Label>College / University</Label>
            <Input value={workEd.college} onChange={e => updateWorkEd('college', e.target.value)} placeholder="University of ..." />
          </div>
        </div>
      );
      case 3: return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Do you have children?</Label>
            <select className="w-full p-2 border rounded" value={family.children} onChange={e => updateFamily('children', e.target.value)}>
              <option value="">Select Option</option>
              {childrenOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Family Plans</Label>
            <select className="w-full p-2 border rounded" value={family.familyPlan} onChange={e => updateFamily('familyPlan', e.target.value)}>
              <option value="">Select Option</option>
              {familyPlanOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>
      );
      case 4: return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Preferred/Display Name *</Label>
            <Input value={identity.preferredName} onChange={e => updateIdentity('preferredName', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Identity Mode *</Label>
            <RadioGroup value={identity.identityMode} onValueChange={v => updateIdentity('identityMode', v)}>
              <div className="flex items-center space-x-2"><RadioGroupItem value="real-name" id="mode1" /><Label htmlFor="mode1">Real Name</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="pseudonym" id="mode2" /><Label htmlFor="mode2">Pseudonym</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="temporary" id="mode3" /><Label htmlFor="mode3">Temporary</Label></div>
            </RadioGroup>
          </div>
          {identity.identityMode === 'temporary' && (
            <div className="space-y-2">
              <Label>Alias Expiry</Label>
              <Input value={identity.aliasExpiry} onChange={e => updateIdentity('aliasExpiry', e.target.value)} placeholder="24h, 7d..." />
            </div>
          )}
          <div className="space-y-2">
            <Label>Verification Method *</Label>
            <RadioGroup value={identity.verificationType} onValueChange={v => updateIdentity('verificationType', v)}>
              <div className="flex items-center space-x-2"><RadioGroupItem value="govt-id" id="v1" /><Label htmlFor="v1">Govt ID</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="college-id" id="v2" /><Label htmlFor="v2">College ID</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="work-id" id="v3" /><Label htmlFor="v3">Work ID</Label></div>
            </RadioGroup>
          </div>
        </div>
      );
      case 5: return (
        <div className="space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            style={{ display: 'none' }}
            accept="image/*"
          />

          <div className="grid grid-cols-3 gap-4">
            {photos.map((url, i) => (
              <div key={i} className="aspect-square bg-slate-100 rounded border relative flex items-center justify-center overflow-hidden">
                <img src={url} alt="Profile" className="w-full h-full object-cover" />
                <button
                  onClick={() => removePhoto(url)}
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {photos.length < 6 && (
              <button
                onClick={handleAddPhotoClick}
                disabled={isUploading}
                className="aspect-square border-2 border-dashed border-slate-300 rounded flex flex-col items-center justify-center hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                {isUploading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-slate-400" />
                    <span className="text-xs mt-1 text-slate-500">Add Photo</span>
                  </>
                )}
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400 text-center">
            Upload up to 6 photos. First photo will be your main profile picture.
          </p>
        </div>
      );
      case 6: return ( // Bio & Prompts
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>About Me</Label>
            <Textarea value={bioData.aboutMe} onChange={e => updateBio('aboutMe', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Short Bio</Label>
            <Input value={bioData.bio} onChange={e => updateBio('bio', e.target.value)} />
          </div>
          {['1', '2', '3'].map(num => (
            <div key={num} className="space-y-3 p-4 border border-slate-200 rounded-xl bg-white shadow-sm relative">
              <Label className="text-xs font-semibold text-cyan-600 uppercase tracking-wider">Prompt {num}</Label>
              <div className="relative">
                <select
                  className="w-full p-2.5 pr-8 border border-slate-200 rounded-lg text-sm bg-slate-50 hover:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all appearance-none cursor-pointer text-slate-700"
                  value={bioData.prompts[`prompt${num}Question`]}
                  onChange={e => updatePrompt(`prompt${num}Question`, null, e.target.value)}
                >
                  <option value="">Select a prompt...</option>
                  {promptCategories.map(cat => (
                    <optgroup key={cat.name} label={cat.name}>
                      {cat.prompts.map(q => (
                        <option key={q} value={q}>{q}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              {bioData.prompts[`prompt${num}Question`] && (
                <Textarea
                  className="rounded-lg border-slate-200 focus-visible:ring-cyan-500/30 mt-2 bg-slate-50 focus:bg-white transition-colors"
                  placeholder="Your answer..."
                  value={bioData.prompts[`prompt${num}Answer`]}
                  onChange={e => updatePrompt(`prompt${num}Answer`, null, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      );
      case 7: return ( // Lifestyle
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Drinking</Label>
              <select className="w-full p-2 border rounded" value={lifestyle.drinking} onChange={e => updateLifestyle('drinking', e.target.value)}>
                <option value="">Select</option>
                {lifestyleFreq.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Smoking</Label>
              <select className="w-full p-2 border rounded" value={lifestyle.smoking} onChange={e => updateLifestyle('smoking', e.target.value)}>
                <option value="">Select</option>
                {lifestyleFreq.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Drugs</Label>
              <select className="w-full p-2 border rounded" value={lifestyle.drugs} onChange={e => updateLifestyle('drugs', e.target.value)}>
                <option value="">Select</option>
                {drugFreq.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Exercise</Label>
              <select className="w-full p-2 border rounded" value={lifestyle.exercise} onChange={e => updateLifestyle('exercise', e.target.value)}>
                <option value="">Select</option>
                {lifestyleFreq.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Relationship Goal</Label>
            <select className="w-full p-2 border rounded" value={lifestyle.datingGoal} onChange={e => updateLifestyle('datingGoal', e.target.value)}>
              <option value="">Select</option>
              {relationshipGoals.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      );
      case 8: return ( // Interests
        <div className="flex flex-wrap gap-2">
          {availableInterests.map(interest => (
            <Badge
              key={interest}
              variant={interests.includes(interest) ? "default" : "outline"}
              className={`cursor-pointer text-sm py-2 px-4 ${interests.includes(interest) ? "bg-blue-600 text-white" : ""}`}
              onClick={() => toggleArrayItem(setInterests, interests, interest, 5)}
            >
              {interest}
            </Badge>
          ))}
          <p className="w-full text-xs text-slate-500 mt-2">Select at least 3</p>
        </div>
      );
      case 9: return ( // Preferences
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Interested In (Gender) *</Label>
            <div className="flex flex-wrap gap-3">
              {['men', 'women', 'everyone'].map(g => (
                <Badge
                  key={g}
                  variant={preferences.interestedInGender.includes(g) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleArrayItem(v => updatePreferences('interestedInGender', v), preferences.interestedInGender, g)}
                >
                  {g.toUpperCase()}
                </Badge>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Min Age</Label>
              <Input type="number" value={preferences.ageRange.min} onChange={e => updateNestedPreferences('ageRange', 'min', e.target.value)} />
            </div>
            <div>
              <Label>Max Age</Label>
              <Input type="number" value={preferences.ageRange.max} onChange={e => updateNestedPreferences('ageRange', 'max', e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Max Distance: {preferences.maxDistance} km</Label>
            <input type="range" min="5" max="100" value={preferences.maxDistance} onChange={e => updatePreferences('maxDistance', e.target.value)} className="w-full" />
          </div>
          <div className="space-y-2">
            <Label>Who can message? *</Label>
            <RadioGroup value={preferences.whoCanMessage} onValueChange={v => updatePreferences('whoCanMessage', v)}>
              <div className="flex items-center space-x-2"><RadioGroupItem value="anyone" id="mc1" /><Label htmlFor="mc1">Anyone</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="same-circle" id="mc2" /><Label htmlFor="mc2">Same Circle</Label></div>
            </RadioGroup>
          </div>
        </div>
      );
    }
  };

  const titles = [
    "Basic Info", "Education & Work", "Family", "Identity", "Photos", "Bio & Prompts", "Lifestyle", "Interests", "Preferences"
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 flex justify-center">
      <Card className="w-full max-w-2xl border-slate-200 shadow-xl h-fit">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            {step > 1 && <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)}><ChevronLeft className="w-4 h-4" /></Button>}
            <span className="text-sm font-medium text-slate-500">Step {step} of 9</span>
            <div />
          </div>
          <CardTitle>{titles[step - 1]}</CardTitle>
          <CardDescription>Complete your profile to join Clique</CardDescription>
          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-1.5 mt-4 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300"
              style={{ width: `${(step / 9) * 100}%` }}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {renderStep()}

          <div className="mt-8 flex justify-end">
            {step < 9 ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
                Next <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={!canProceed() || isLoading} className="bg-green-600 hover:bg-green-700">
                {isLoading ? "Saving..." : "Complete Profile"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}