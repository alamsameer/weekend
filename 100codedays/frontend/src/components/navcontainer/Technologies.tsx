import React, { useState } from 'react';

interface Technology {
  name: string;
  category: 'Web Dev' | 'ML/AI' | 'Data Engineering';
}

const Technologies: React.FC = () => {
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);

  const technologies: Technology[] = [
    { name: 'React', category: 'Web Dev' },
    { name: 'Vue.js', category: 'Web Dev' },
    { name: 'Angular', category: 'Web Dev' },
    { name: 'Node.js', category: 'Web Dev' },
    { name: 'TensorFlow', category: 'ML/AI' },
    { name: 'PyTorch', category: 'ML/AI' },
    { name: 'Scikit-learn', category: 'ML/AI' },
    { name: 'Apache Spark', category: 'Data Engineering' },
    { name: 'Hadoop', category: 'Data Engineering' },
    { name: 'Kafka', category: 'Data Engineering' },
    { name: 'Docker', category: 'Web Dev' },
    { name: 'Kubernetes', category: 'Web Dev' },
    { name: 'GraphQL', category: 'Web Dev' },
    { name: 'MongoDB', category: 'Data Engineering' },
    { name: 'PostgreSQL', category: 'Data Engineering' }
  ];

  const handleTechnologySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tech = e.target.value;
    if (selectedTechnologies.includes(tech)) {
      setSelectedTechnologies(selectedTechnologies.filter(t => t !== tech));
    } else {
      setSelectedTechnologies([...selectedTechnologies, tech]);
    }
  };

  return (
    <div className=" p-10  mx-auto mt-12 shadow-lg text-center font-orbitron text-gray-400">
      <h2 className="text-2xl mb-5 bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
        Technologies
      </h2>

      <div className="mb-6 text-left">
        <label className="block text-sm mb-2 text-gray-400" htmlFor="technologies">
          Select Technologies:
        </label>
        <div className="grid grid-cols-3 gap-4">
          {technologies.map((tech) => (
            <label
              key={tech.name}
              className={`block text-center text-sm p-3 rounded-full cursor-pointer transition-all duration-300 ${
                selectedTechnologies.includes(tech.name)
                  ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white'
                  : 'bg-gray-800 text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-green-500'
              }`}
            >
              <input
                type="checkbox"
                name="technologies"
                value={tech.name}
                checked={selectedTechnologies.includes(tech.name)}
                onChange={handleTechnologySelect}
                className="hidden"
              />
              {tech.name}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl mb-3 text-gray-300">Selected Technologies:</h3>
        <ul className="list-disc list-inside">
          {selectedTechnologies.map((tech) => (
            <li key={tech} className="text-gray-400">{tech}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Technologies;
