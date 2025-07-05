import { FaAmbulance, FaPhone, FaMapMarkerAlt, FaTint, FaExclamationTriangle } from 'react-icons/fa'
import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const Emergency = () => {
  const navigate = useNavigate();
  const hospitalsRef = useRef(null);

  const emergencyContacts = [
    { name: 'National Emergency Services', number: '911', description: 'For all medical emergencies' },
    { name: 'Blood Bank Directory', number: '1-800-RED-CROSS', description: 'American Red Cross Blood Services' },
    { name: 'Emergency Blood Request', number: '1-800-BLOOD-NOW', description: '24/7 Emergency Blood Request Hotline' },
    { name: 'Poison Control', number: '1-800-222-1222', description: 'Poison Control Center' }
  ]

  const nearbyHospitals = [
    {
      name: 'City General Hospital',
      address: '123 Main Street, City, State 12345',
      phone: '(555) 123-4567',
      distance: '2.1 miles',
      services: ['Emergency Care', 'Blood Bank', 'Trauma Center']
    },
    {
      name: 'St. Mary\'s Medical Center',
      address: '456 Oak Avenue, City, State 12345',
      phone: '(555) 987-6543',
      distance: '3.5 miles',
      services: ['Emergency Care', 'Blood Bank', 'ICU']
    },
    {
      name: 'University Hospital',
      address: '789 College Drive, City, State 12345',
      phone: '(555) 456-7890',
      distance: '4.2 miles',
      services: ['Emergency Care', 'Blood Bank', 'Specialized Care']
    }
  ]

  const bloodBanks = [
    {
      name: 'American Red Cross Blood Center',
      address: '101 Blood Drive, City, State 12345',
      phone: '(555) RED-CROSS',
      hours: 'Mon-Fri: 8AM-8PM, Sat-Sun: 9AM-5PM',
      bloodTypes: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
    },
    {
      name: 'City Blood Bank',
      address: '202 Health Street, City, State 12345',
      phone: '(555) 246-8135',
      hours: '24/7 Emergency Services',
      bloodTypes: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-']
    }
  ]

  const emergencyTips = [
    {
      title: 'Before Requesting Blood',
      tips: [
        'Confirm blood type with medical professional',
        'Get hospital authorization letter',
        'Have patient information ready',
        'Contact multiple donors if urgent'
      ]
    },
    {
      title: 'During Emergency',
      tips: [
        'Stay calm and provide accurate information',
        'Have backup contact numbers ready',
        'Keep medical records accessible',
        'Follow hospital protocols'
      ]
    },
    {
      title: 'Important Information',
      tips: [
        'Know your blood type and allergies',
        'Keep emergency contacts updated',
        'Have insurance information ready',
        'Know nearest hospital locations'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 p-4 rounded-full">
              <FaExclamationTriangle className="text-red-600 text-4xl" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Emergency Blood Request</h1>
          <p className="text-xl text-gray-600">Get immediate help for critical blood needs</p>
        </div>

        {/* Emergency Alert */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
          <div className="flex items-center space-x-3">
            <FaAmbulance className="text-red-600 text-2xl" />
            <div>
              <h2 className="text-lg font-semibold text-red-800">For Life-Threatening Emergencies</h2>
              <p className="text-red-700">Call 911 immediately or go to the nearest emergency room. Use this platform for urgent but non-critical blood requests.</p>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            className="emergency-pulse card text-center p-6 hover:shadow-lg transition-shadow"
            onClick={() => navigate('/blood-request')}
          >
            <FaTint className="text-primary-600 text-3xl mb-3 mx-auto" />
            <h3 className="font-semibold text-gray-900 mb-2">Emergency Blood Request</h3>
            <p className="text-sm text-gray-600">Submit urgent blood request</p>
          </button>
          
          <a
            className="card text-center p-6 hover:shadow-lg transition-shadow"
            href="tel:911"
          >
            <FaPhone className="text-green-600 text-3xl mb-3 mx-auto" />
            <h3 className="font-semibold text-gray-900 mb-2">Call Emergency Hotline</h3>
            <p className="text-sm text-gray-600">24/7 emergency assistance</p>
          </a>
          
          <button
            className="card text-center p-6 hover:shadow-lg transition-shadow"
            onClick={() => hospitalsRef.current?.scrollIntoView({ behavior: 'smooth' })}
          >
            <FaMapMarkerAlt className="text-blue-600 text-3xl mb-3 mx-auto" />
            <h3 className="font-semibold text-gray-900 mb-2">Find Nearest Hospital</h3>
            <p className="text-sm text-gray-600">Locate emergency services</p>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Emergency Contacts */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FaPhone className="text-primary-600 mr-2" />
              Emergency Contacts
            </h2>
            <div className="space-y-4">
              {emergencyContacts.map((contact, index) => (
                <div key={index} className="border-l-4 border-primary-500 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{contact.name}</h3>
                      <p className="text-sm text-gray-600">{contact.description}</p>
                    </div>
                    <a href={`tel:${contact.number}`} className="text-primary-600 font-bold hover:text-primary-700">
                      {contact.number}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Tips */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FaExclamationTriangle className="text-yellow-600 mr-2" />
              Emergency Guidelines
            </h2>
            <div className="space-y-4">
              {emergencyTips.map((section, index) => (
                <div key={index}>
                  <h3 className="font-medium text-gray-900 mb-2">{section.title}</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {section.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start">
                        <span className="text-primary-600 mr-2">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Nearby Hospitals */}
        <div ref={hospitalsRef} className="card mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FaMapMarkerAlt className="text-primary-600 mr-2" />
            Nearby Hospitals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nearbyHospitals.map((hospital, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">{hospital.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{hospital.address}</p>
                <p className="text-sm text-primary-600 font-medium mb-2">{hospital.distance}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {hospital.services.map((service, serviceIndex) => (
                    <span key={serviceIndex} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {service}
                    </span>
                  ))}
                </div>
                <a href={`tel:${hospital.phone}`} className="text-primary-600 hover:text-primary-700 font-medium">
                  {hospital.phone}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Blood Banks */}
        <div className="card mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <FaTint className="text-primary-600 mr-2" />
            Blood Banks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bloodBanks.map((bank, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">{bank.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{bank.address}</p>
                <p className="text-sm text-gray-600 mb-2">{bank.hours}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {bank.bloodTypes.map((type, typeIndex) => (
                    <span key={typeIndex} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                      {type}
                    </span>
                  ))}
                </div>
                <a href={`tel:${bank.phone}`} className="text-primary-600 hover:text-primary-700 font-medium">
                  {bank.phone}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Emergency