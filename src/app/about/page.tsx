export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Community Guidelines
          </h1>
          <p className="text-sm md:text-base text-gray-700 leading-relaxed max-w-2xl mx-auto">
            Thank you for being part of <span className="font-bold text-blue-600">First Mentor</span>!<br />
            Our goal is to create a space where students feel supported, mentors feel appreciated, and families feel confident that everyone is safe.
          </p>
        </div>

        {/* Guidelines List */}
        <div className="space-y-8 mb-16">
          {/* Guideline 1 */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-blue-600 mr-3">1.</span>
              Be Kind and Respectful
            </h2>
            <p className="text-xs text-gray-700 leading-relaxed mb-2">
              We are a community that learns together.
            </p>
            <p className="text-xs text-gray-700 leading-relaxed">
              Please treat others with patience, kindness, and understanding.
            </p>
          </div>

          {/* Guideline 2 */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-blue-600 mr-3">2.</span>
              Support Each Other
            </h2>
            <p className="text-xs text-gray-700 leading-relaxed mb-2">
              Everyone is at a different stage in their STEM journey..
            </p>
            <p className="text-xs text-gray-700 leading-relaxed">
              Encourage questions, celebrate progress, and help one another grow.
            </p>
          </div>

          {/* Guideline 3 */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-blue-600 mr-3">3.</span>
              Support Diverse Mentorship
            </h2>
            <p className="text-xs text-gray-700 leading-relaxed mb-2">
              We welcome mentors from every background: students, alumni, coaches, and professionals. Anyone can be a mentor, a mentee, or both. For example, an FRC team member can get help with their own robot while mentoring FTC or FLL teams.
            </p>
            <p className="text-xs text-gray-700 leading-relaxed">
              First Mentor is free and volunteer-based. It only helps people find and contact each other; any arrangements are made directly between mentors and mentees, and First Mentor is not responsible for them.
            </p>
          </div>

          {/* Guideline 4 */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-blue-600 mr-3">4.</span>
              Keep Everyone Safe
            </h2>
            <p className="text-xs text-gray-700 leading-relaxed mb-2">
              Safety is our top priority.
            </p>
            <p className="text-xs text-gray-700 leading-relaxed">
              Please keep all interactions appropriate, respectful, and youth-friendly.
            </p>
          </div>

          {/* Guideline 5 */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-blue-600 mr-3">5.</span>
              Protect Privacy
            </h2>
            <p className="text-xs text-gray-700 leading-relaxed mb-2">
              Do not share anyone's personal information without their permission.
            </p>
            <p className="text-xs text-gray-700 leading-relaxed">
              Parents can always reach out if they have concerns.
            </p>
          </div>

          {/* Guideline 6 */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-blue-600 mr-3">6.</span>
              Stay Focused on Learning
            </h2>
            <p className="text-xs text-gray-700 leading-relaxed mb-2">
              Conversations should relate to STEM, robotics, mentorship, teamwork, or education.
            </p>
            <p className="text-xs text-gray-700 leading-relaxed">
              Let's keep the space helpful and welcoming for everyone.
            </p>
          </div>

          {/* Guideline 7 */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-blue-600 mr-3">7.</span>
              No Spam or Unwanted Promotions
            </h2>
            <p className="text-xs text-gray-700 leading-relaxed">
              Share resources because they help others—not for advertising.
            </p>
          </div>

          {/* Guideline 8 */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="text-blue-600 mr-3">8.</span>
              Speak Up if Something Feels Wrong
            </h2>
            <p className="text-xs text-gray-700 leading-relaxed mb-2">
              If you see or experience something concerning, please report it.
            </p>
            <p className="text-xs text-gray-700 leading-relaxed">
              We're here to make this community positive, safe, and supportive.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}