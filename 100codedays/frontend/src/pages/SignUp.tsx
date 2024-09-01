import React, { useState } from 'react';
import BasicInfo from '../components/signup/BasicInfo.tsx';
import Interests from '../components/signup/Interests.tsx';
import Goals from '../components/signup/Goals.tsx';
import Approach from '../components/signup/Approach.tsx';
import FunFacts from '../components/signup/FunFacts.tsx';
import FinalQuestions from '../components/signup/FinalQuestions.tsx';

const SignUp: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    interests: [] as string[],
    technologies: [] as string[],
    challenges: '',
    goal: '',
    motivation: '',
    skillLevel: '',
    hoursPerDay: '',
    learningStyle: '',
    funFact: '',
    favLanguage: '',
    superpower: '',
    dreamJob: '',
    learningMotivation: '',
    challengeGoal: '',
    progressTracking: '',
    additionalInfo: '',
    hearAboutUs: '',
    termsAgreed:false,
    password:''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };


  const handleMultiSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prevState) => ({
      ...prevState,
      technologies: prevState.technologies.includes(value)
        ? prevState.technologies.filter((tech) => tech !== value)
        : [...prevState.technologies, value],
    }));
  };

  const handleMultiSelectInterest = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prevState) => ({
      ...prevState,
      interests: prevState.interests.includes(value)
        ? prevState.interests.filter((interest) => interest !== value)
        : [...prevState.interests, value],
    }));
  };
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: checked
    }));
  };

  const handleNext = () => {
    setStep(prevStep => prevStep + 1);
  };

  const handlePrevious = () => {
    setStep(prevStep => prevStep - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log(formData);
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return <BasicInfo formData={formData} handleChange={handleChange} handleNext={handleNext} />;
      case 2:
        return <Interests formData={formData} handleMultiSelectInterest={handleMultiSelectInterest} handleMultiSelect={handleMultiSelect} handlePrevious={handlePrevious} handleNext={handleNext} />;
      case 3:
        return <Goals formData={formData} handleChange={handleChange} handlePrevious={handlePrevious} handleNext={handleNext} />;
      case 4:
        return <Approach formData={formData} handleChange={handleChange} handlePrevious={handlePrevious} handleNext={handleNext} />;
      case 5:
        return <FunFacts formData={formData} handleChange={handleChange} handlePrevious={handlePrevious} handleNext={handleNext} />;
      case 6:
        return <FinalQuestions 
          formData={formData} 
          handleChange={handleChange} 
          handleCheckboxChange={handleCheckboxChange}
          handlePrevious={handlePrevious} 
          handleSubmit={handleSubmit} 
        />;
      default:
        return null;
    }
  };

  return (
    <div className="sign-up-container" style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>Sign Up for 100 Code Days</h1>
      <div>
        {renderStep()}
      </div>
    </div>
  );
};

export default SignUp;





