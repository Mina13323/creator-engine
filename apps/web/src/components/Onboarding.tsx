'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import {
  Lightbulb, Sparkles, Pencil, MapPin, Globe, DollarSign,
  FileText, BarChart, Store, CheckCircle, ChevronLeft, Loader2
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const UNIQUE_IDEAS = [
  'Fresh ingredients', 'Family friendly', 'Fast service', 'Trusted quality',
  'Local sourcing', 'Friendly staff', 'Freshly prepared', 'Daily specials',
  'Clean environment', 'Natural flavors'
];

const NAME_IDEAS = [
  'Cairo Courtyard', 'Fresh Hearth Foods', 'Nourish Now', 'Trusty Table',
  'Family First Market', 'Crisp Corner Kitchen', 'Local Line Deli',
  'Daily Delight Hub', 'Harvest Home Meals', 'QuickServe Fresh'
];

export default function Onboarding() {
  const { createProject, loadProjects, loading, loadingMessage, setAuthModalOpen, user } = useStore();

  const [step, setStep] = useState(1);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Unknown, Cairo Governorate, Egypt');
  const [language, setLanguage] = useState('english');
  const [currency, setCurrency] = useState('usd');
  const [uniqueFeatures, setUniqueFeatures] = useState<string[]>([]);
  const [name, setName] = useState('');

  const toggleUniqueFeature = (feature: string) => {
    if (uniqueFeatures.includes(feature)) {
      setUniqueFeatures(uniqueFeatures.filter(f => f !== feature));
    } else {
      setUniqueFeatures([...uniqueFeatures, feature]);
    }
  };

  const handleLaunch = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    // Mapping our new flow to the existing store payload
    const payload = {
      name: name || 'My New Venture',
      description: `${description}. Unique features: ${uniqueFeatures.join(', ')}`,
      industry: 'E-commerce', // Default
      skills: uniqueFeatures.length > 0 ? uniqueFeatures : ['Digital Marketing'],
      budget: currency === 'usd' ? 1000 : 500,
      location: location,
    };
    await createProject(payload);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center pt-24 p-6 font-sans">
        {/* Header / Logo */}
        <div className="absolute top-6 left-6 flex items-center gap-2">
          <div className="w-5 h-5 flex gap-1">
            <div className="w-1/2 h-full bg-emerald-500 rounded-sm skew-x-12"></div>
            <div className="w-1/2 h-full bg-emerald-500 rounded-sm -skew-x-12"></div>
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">CEO</span>
        </div>

        <div className="absolute top-6 right-6">
          {!user ? (
            <Button onClick={() => setAuthModalOpen(true)} variant="ghost" className="text-emerald-600 font-semibold hover:text-emerald-700 hover:bg-emerald-50">Login</Button>
          ) : (
            <span className="text-emerald-700 font-medium text-sm">Logged in as {user.name || user.email}</span>
          )}
        </div>

        <div className="w-full max-w-xl text-center space-y-6 mt-12">
          <div className="flex justify-center gap-4 text-purple-500 mb-6">
            <FileText className="w-5 h-5" />
            <Sparkles className="w-5 h-5" />
            <Pencil className="w-5 h-5" />
          </div>

          <h1 className="text-2xl font-medium text-slate-900 mb-10">Just a few final details. You can change this later.</h1>

          <div className="text-left space-y-2">
            <h3 className="font-medium text-slate-900">Concept</h3>
            <div className="flex items-center gap-3 text-slate-500 text-sm">
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
              <span>{loadingMessage || 'Pulling together your concept...'}</span>
            </div>
          </div>

          <div className="pt-8">
            <Button
              className="w-full bg-emerald-300 hover:bg-emerald-400 text-white rounded-xl py-6 text-base font-semibold transition-colors pointer-events-none"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const renderStepIcon = () => {
    switch (step) {
      case 1:
        return (
          <div className="flex justify-center gap-4 text-amber-500 mb-8">
            <Lightbulb className="w-5 h-5" />
            <Sparkles className="w-5 h-5" />
            <Pencil className="w-5 h-5" />
          </div>
        );
      case 2:
        return (
          <div className="flex justify-center gap-4 text-emerald-600 mb-8">
            <MapPin className="w-5 h-5" />
            <Globe className="w-5 h-5" />
            <DollarSign className="w-5 h-5" />
          </div>
        );
      case 3:
        return (
          <div className="flex justify-center gap-4 text-indigo-500 mb-8">
            <FileText className="w-5 h-5" />
            <BarChart className="w-5 h-5" />
            <Sparkles className="w-5 h-5" />
          </div>
        );
      case 4:
        return (
          <div className="flex justify-center gap-4 text-rose-500 mb-8">
            <Store className="w-5 h-5" />
            <CheckCircle className="w-5 h-5" />
            <Pencil className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col relative font-sans">
      {/* Header / Logo */}
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <div className="w-5 h-5 flex gap-1">
          <div className="w-1/2 h-full bg-emerald-500 rounded-sm skew-x-12"></div>
          <div className="w-1/2 h-full bg-emerald-500 rounded-sm -skew-x-12"></div>
        </div>
        <span className="font-bold text-lg text-slate-900 tracking-tight">Venturekit</span>
      </div>

      <div className="absolute top-6 right-6">
        {!user ? (
          <Button onClick={() => setAuthModalOpen(true)} variant="ghost" className="text-emerald-600 font-semibold hover:text-emerald-700 hover:bg-emerald-50">Login</Button>
        ) : (
          <span className="text-emerald-700 font-medium text-sm">Logged in as {user.name || user.email}</span>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-xl">
          {renderStepIcon()}

          <div className="relative">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="absolute left-0 top-1.5 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <h1 className="text-2xl font-medium text-center text-slate-900 mb-6">
              {step === 1 && "What's your business idea?"}
              {step === 2 && "Where is your business located?"}
              {step === 3 && "What makes your business unique?"}
              {step === 4 && "What is your business name?"}
            </h1>
          </div>

          {/* Form Content */}
          <div className="space-y-6">
            {step === 1 && (
              <div className="relative">
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="E.g. dog walking"
                  className="w-full rounded-xl py-6 px-4 text-base border-slate-300 focus-visible:ring-emerald-500 text-slate-900 bg-white"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Unknown, Cairo Governorate, Egypt"
                  className="w-full rounded-xl py-6 px-4 text-base border-slate-300 focus-visible:ring-emerald-500 text-slate-900 bg-white"
                />
                <div className="flex justify-center gap-4 pt-2">
                  <Select value={language} onValueChange={(val) => setLanguage(val || '')}>
                    <SelectTrigger className="w-[140px] rounded-xl border-none shadow-none text-slate-600 focus:ring-0 font-medium">
                      <SelectValue placeholder="English" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="arabic">Arabic</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={currency} onValueChange={(val) => setCurrency(val || '')}>
                    <SelectTrigger className="w-[140px] rounded-xl border-none shadow-none text-slate-600 focus:ring-0 font-medium bg-amber-50">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center text-xs text-amber-700 font-bold">$</div>
                        <SelectValue placeholder="Dollar" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">Dollar</SelectItem>
                      <SelectItem value="egp">EGP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="relative">
                  <Input
                    value={uniqueFeatures.join(', ')}
                    onChange={() => { }}
                    placeholder="E.g. all-natural ingredients, warm atmosphere, etc."
                    className="w-full rounded-xl py-6 px-4 text-base border-slate-300 focus-visible:ring-emerald-500 text-slate-900 bg-white"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium text-slate-500">Ideas</span>
                    <Button variant="ghost" size="sm" className="h-8 rounded-full text-slate-500 bg-slate-50 hover:bg-slate-100 font-medium">
                      <Loader2 className="w-3 h-3 mr-2" /> More
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {UNIQUE_IDEAS.map(idea => (
                      <Badge
                        key={idea}
                        variant="outline"
                        className={`cursor-pointer px-4 py-2 text-sm font-medium rounded-full border-slate-200 transition-colors ${uniqueFeatures.includes(idea) ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'hover:bg-slate-50 text-slate-700 bg-white'
                          }`}
                        onClick={() => toggleUniqueFeature(idea)}
                      >
                        {idea}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.g. Happy Hounds"
                  className="w-full rounded-xl py-6 px-4 text-base border-slate-300 focus-visible:ring-emerald-500 text-slate-900 bg-white"
                />

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium text-slate-500">Ideas</span>
                    <Button variant="ghost" size="sm" className="h-8 rounded-full text-slate-500 bg-slate-50 hover:bg-slate-100 font-medium">
                      <Loader2 className="w-3 h-3 mr-2" /> More
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {NAME_IDEAS.map(idea => (
                      <Badge
                        key={idea}
                        variant="outline"
                        className={`cursor-pointer px-4 py-2 text-sm font-medium rounded-full border-slate-200 transition-colors ${name === idea ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'hover:bg-slate-50 text-slate-700 bg-white'
                          }`}
                        onClick={() => setName(idea)}
                      >
                        {idea}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={() => {
                if (step < 4) {
                  setStep(step + 1);
                } else {
                  handleLaunch();
                }
              }}
              className="w-full bg-[#00A86B] hover:bg-[#008f5a] text-white rounded-xl py-6 text-base font-semibold transition-colors mt-4"
            >
              Next
            </Button>
          </div>
        </div>

        {/* Stepper Dots */}
        <div className="absolute bottom-16 flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-slate-400' : 'w-1.5 bg-slate-200'
                }`}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <div className="w-3 h-3 border border-slate-400 rounded-sm flex items-center justify-center">
            <span className="text-[8px] font-bold">Q</span>
          </div>
          <span>Private & secure. See our <a href="#" className="underline">privacy policy</a>.</span>
        </div>
      </div>
    </div>
  );
}
