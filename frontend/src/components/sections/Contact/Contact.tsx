import { useState } from 'react'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Add form submission logic here
    console.log(formData)
    alert('Thank you for your message! We will get back to you soon.')
    // Reset form
    setFormData({ name: '', email: '', message: '' })
  }

  return (
    <section className="py-16" id="contact">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold mb-4">Get in Touch</h2>
          <div className="w-16 h-1 bg-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 max-w-lg mx-auto">
            Have questions about our accommodations or services? Send us a
            message and our team will get back to you as soon as possible.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-5">
            <div className="bg-primary text-white p-8 md:col-span-2">
              <h3 className="text-xl font-bold mb-4">Contact Information</h3>
              <p className="mb-8">
                Fill up the form and our team will get back to you within 24
                hours
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-white/20 p-2 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-white/80">+1 234 567 890</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-white/20 p-2 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-white/80">info@elitehotel.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-white/20 p-2 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-white/80">123 Hotel Street, City</p>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 md:col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Your Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Your Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    required
                  />
                </div>
              </div>

              <div className="mt-6">
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Your Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  rows={4}
                  required
                />
              </div>

              <button
                type="submit"
                className="mt-6 bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
