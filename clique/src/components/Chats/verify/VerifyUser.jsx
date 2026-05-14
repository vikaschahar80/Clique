import { useState } from 'react';
import { 
  GraduationCap, 
  Briefcase, 
  User, 
  Mail, 
  Camera, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  Shield,
  ChevronRight
} from 'lucide-react';

export function VerifyUser() {
  const [selectedType, setSelectedType] = useState(null);
  const [currentStep, setCurrentStep] = useState('select');
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [idCardUploaded, setIdCardUploaded] = useState(false);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);

  const verificationTypes = [
    {
      type: 'college',
      icon: GraduationCap,
      title: 'College ID Verification',
      description: 'Verify using your college email or student ID',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      requirements: ['Face Verification', 'College Email OR ID Card Scan']
    },
    {
      type: 'work',
      title: 'Work ID Verification',
      icon: Briefcase,
      description: 'Verify using your work email or employee ID',
      color: 'from-cyan-500 to-blue-600',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      requirements: ['Face Verification', 'Work Email OR ID Card Scan']
    },
    {
      type: 'personal',
      icon: User,
      title: 'Personal Verification',
      description: 'Quick verification using face recognition only',
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      requirements: ['Face Verification']
    }
  ];

  const handleSelectType = (type) => {
    setSelectedType(type);
    setCurrentStep('verify');
    // Reset verification states
    setSelectedMethod(null);
    setEmailVerified(false);
    setFaceVerified(false);
    setIdCardUploaded(false);
    setEmail('');
    setVerificationCode('');
    setShowCodeInput(false);
  };

  const handleSendCode = () => {
    if (email) {
      setShowCodeInput(true);
      // Simulate sending verification code
      console.log('Verification code sent to:', email);
    }
  };

  const handleVerifyEmail = () => {
    if (verificationCode) {
      setEmailVerified(true);
      // Simulate email verification
      console.log('Email verified');
    }
  };

  const handleFaceVerification = () => {
    // Simulate face verification
    setFaceVerified(true);
    console.log('Face verification started');
  };

  const handleIdUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setIdCardUploaded(true);
      console.log('ID card uploaded:', e.target.files[0].name);
    }
  };

  const isVerificationComplete = () => {
    if (selectedType === 'personal') {
      return faceVerified;
    }
    // For college and work: face + (email OR id card)
    return faceVerified && (emailVerified || idCardUploaded);
  };

  const selectedTypeData = verificationTypes.find(vt => vt.type === selectedType);

  if (currentStep === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="size-12 text-cyan-600" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                Verify Your Account
              </h1>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose how you'd like to verify your identity on Clique. Verified accounts get more trust and better connections!
            </p>
          </div>

          {/* Verification Type Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {verificationTypes.map((vType) => (
              <button
                key={vType.type}
                onClick={() => handleSelectType(vType.type)}
                className={`${vType.bgColor} ${vType.borderColor} border-2 rounded-2xl p-6 text-left hover:shadow-xl transition-all transform hover:-translate-y-1 group`}
              >
                <div className={`bg-gradient-to-r ${vType.color} size-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <vType.icon className="size-7 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-2">{vType.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{vType.description}</p>
                
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Requirements:</p>
                  {vType.requirements.map((req) => (
                    <div key={req} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="size-4 text-green-500" />
                      <span>{req}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between text-sm font-semibold">
                  <span className={`bg-gradient-to-r ${vType.color} bg-clip-text text-transparent`}>
                    Get Started
                  </span>
                  <ChevronRight className="size-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="size-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Why Verify?</h4>
              <p className="text-sm text-blue-800">
                Verified accounts are more trusted in the community and get priority visibility. 
                Your verification data is securely stored and never shared publicly.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Verification Steps Page
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => setCurrentStep('select')}
          className="mb-6 text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <ChevronRight className="size-4 rotate-180" />
          Back to verification types
        </button>

        {/* Header */}
        <div className={`${selectedTypeData?.bgColor} ${selectedTypeData?.borderColor} border-2 rounded-2xl p-6 mb-8`}>
          <div className="flex items-center gap-4">
            <div className={`bg-gradient-to-r ${selectedTypeData?.color} size-16 rounded-xl flex items-center justify-center`}>
              {selectedTypeData?.icon && <selectedTypeData.icon className="size-8 text-white" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">{selectedTypeData?.title}</h2>
              <p className="text-gray-600">{selectedTypeData?.description}</p>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8 bg-white rounded-xl border-2 border-gray-200 p-4">
          <div className="flex items-center justify-between text-sm">
            <div className={`flex items-center gap-2 ${faceVerified ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`size-6 rounded-full flex items-center justify-center ${faceVerified ? 'bg-green-500' : 'bg-gray-200'}`}>
                {faceVerified ? <CheckCircle className="size-4 text-white" /> : <span className="text-xs font-bold text-gray-500">1</span>}
              </div>
              <span className="font-medium">Face Verification</span>
            </div>
            
            {(selectedType === 'college' || selectedType === 'work') && (
              <>
                <div className={`h-0.5 flex-1 mx-2 ${faceVerified ? 'bg-cyan-300' : 'bg-gray-200'}`} />
                <div className={`flex items-center gap-2 ${(emailVerified || idCardUploaded) ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`size-6 rounded-full flex items-center justify-center ${(emailVerified || idCardUploaded) ? 'bg-green-500' : 'bg-gray-200'}`}>
                    {(emailVerified || idCardUploaded) ? <CheckCircle className="size-4 text-white" /> : <span className="text-xs font-bold text-gray-500">2</span>}
                  </div>
                  <span className="font-medium">Additional Verification</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Verification Steps */}
        <div className="space-y-6">
          {/* Step 1: Face Verification - Required for all */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div className={`${faceVerified ? 'bg-green-500' : 'bg-cyan-500'} size-10 rounded-full flex items-center justify-center flex-shrink-0`}>
                {faceVerified ? (
                  <CheckCircle className="size-6 text-white" />
                ) : (
                  <Camera className="size-5 text-white" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg">Step 1: Face Verification</h3>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-semibold">
                    Required
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Take a selfie to verify your identity. This helps keep the Clique community safe and authentic.
                </p>

                {!faceVerified ? (
                  <div className="space-y-3">
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Camera className="size-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 text-sm mb-4">
                        Position your face in the camera and take a clear photo
                      </p>
                      <button
                        onClick={handleFaceVerification}
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium"
                      >
                        Start Face Verification
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                      Make sure you're in a well-lit area and looking directly at the camera
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="size-5" />
                    <span className="font-medium">Face verified successfully!</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step 2: Choose Verification Method - Only for College & Work */}
          {(selectedType === 'college' || selectedType === 'work') && faceVerified && !selectedMethod && (
            <div className="bg-white rounded-xl border-2 border-cyan-300 p-6">
              <div className="mb-4">
                <h3 className="font-bold text-lg mb-1">Step 2: Choose Your Verification Method</h3>
                <p className="text-gray-600 text-sm">
                  Select how you'd like to verify your {selectedType === 'college' ? 'college' : 'work'} affiliation
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email Verification Option */}
                <button
                  onClick={() => setSelectedMethod('email')}
                  className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-xl p-6 text-left hover:border-cyan-400 hover:shadow-lg transition-all group"
                >
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-600 size-12 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Mail className="size-6 text-white" />
                  </div>
                  <h4 className="font-bold mb-2">Email Verification</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Verify using your {selectedType === 'college' ? 'college (.edu)' : 'work'} email address
                  </p>
                  <div className="flex items-center gap-2 text-cyan-600 text-sm font-medium">
                    <span>Choose Email</span>
                    <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* ID Card Upload Option */}
                <button
                  onClick={() => setSelectedMethod('idcard')}
                  className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 text-left hover:border-purple-400 hover:shadow-lg transition-all group"
                >
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 size-12 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="size-6 text-white" />
                  </div>
                  <h4 className="font-bold mb-2">ID Card Upload</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Upload your {selectedType === 'college' ? 'student ID card' : 'employee ID card'}
                  </p>
                  <div className="flex items-center gap-2 text-purple-600 text-sm font-medium">
                    <span>Choose ID Card</span>
                    <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Email Verification Section */}
          {(selectedType === 'college' || selectedType === 'work') && faceVerified && selectedMethod === 'email' && (
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className={`${emailVerified ? 'bg-green-500' : 'bg-cyan-500'} size-10 rounded-full flex items-center justify-center flex-shrink-0`}>
                  {emailVerified ? (
                    <CheckCircle className="size-6 text-white" />
                  ) : (
                    <Mail className="size-5 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg">
                      {selectedType === 'college' ? 'College Email' : 'Work Email'} Verification
                    </h3>
                    <button
                      onClick={() => {
                        setSelectedMethod(null);
                        setEmail('');
                        setShowCodeInput(false);
                        setVerificationCode('');
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Change method
                    </button>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Enter your {selectedType === 'college' ? 'college' : 'work'} email address to receive a verification code
                  </p>

                  {!emailVerified ? (
                    <div className="space-y-3">
                      <div>
                        <input
                          type="email"
                          placeholder={selectedType === 'college' ? 'student@university.edu' : 'you@company.com'}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>

                      {showCodeInput && (
                        <div>
                          <input
                            type="text"
                            placeholder="Enter verification code"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 mb-2"
                          />
                          <button
                            onClick={handleVerifyEmail}
                            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2 rounded-lg hover:opacity-90 transition-opacity font-medium"
                          >
                            Verify Email
                          </button>
                        </div>
                      )}

                      {!showCodeInput && (
                        <button
                          onClick={handleSendCode}
                          disabled={!email}
                          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2 rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Send Verification Code
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="size-5" />
                      <span className="font-medium">Email verified successfully!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ID Card Upload Section */}
          {(selectedType === 'college' || selectedType === 'work') && faceVerified && selectedMethod === 'idcard' && (
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className={`${idCardUploaded ? 'bg-green-500' : 'bg-purple-500'} size-10 rounded-full flex items-center justify-center flex-shrink-0`}>
                  {idCardUploaded ? (
                    <CheckCircle className="size-6 text-white" />
                  ) : (
                    <Upload className="size-5 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-lg">ID Card Upload</h3>
                    <button
                      onClick={() => {
                        setSelectedMethod(null);
                        setIdCardUploaded(false);
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Change method
                    </button>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Upload your {selectedType === 'college' ? 'student ID card' : 'employee ID card'} for verification
                  </p>

                  {!idCardUploaded ? (
                    <div className="space-y-3">
                      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <Upload className="size-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 text-sm mb-4">
                          Upload a clear photo of your ID card (front side)
                        </p>
                        <label className="inline-block bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium cursor-pointer">
                          Choose File
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleIdUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 text-center">
                        Supported formats: JPG, PNG, PDF (Max 5MB)
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="size-5" />
                      <span className="font-medium">ID card uploaded successfully!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Complete Verification Button */}
        <div className="mt-8 bg-white rounded-xl border-2 border-gray-200 p-6">
          <button
            onClick={() => console.log('Verification completed')}
            disabled={!isVerificationComplete()}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isVerificationComplete() ? (
              <>
                <CheckCircle className="size-6" />
                Complete Verification
              </>
            ) : (
              <>
                <AlertCircle className="size-6" />
                Complete Required Steps
              </>
            )}
          </button>
          
          {!isVerificationComplete() && (
            <p className="text-center text-sm text-gray-500 mt-3">
              {!faceVerified 
                ? 'Please complete face verification to continue' 
                : selectedType === 'personal' 
                  ? 'Please complete face verification'
                  : 'Please choose and complete a verification method (Email or ID Card)'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}