import { Phone, Mail, Clock, Facebook } from "lucide-react";
import Header from "@/components/Header";

/**
 * Contact Page - Restaurant information and location
 * Design: Clean layout following header color scheme
 */
export default function Contact() {
  const restaurantInfo = {
    name: "Tatun's Kambingan",
    address: "Tarlac City, Philippines",
    fullAddress: "123 Main Street, Brgy. San Nicolas, Tarlac City 2300",
    phone: "+63 (123) 456-789",
    email: "info@tatunsk.com",
    // Updated Schedule
    hours: [
      { day: "Monday - Saturday", time: "9:00 AM - 3:00 PM" },
      { day: "Sunday", time: "CLOSED" },
    ],
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />

      {/* Hero Section */}
      <section style={{ backgroundColor: "#6a1b1a" }} className="py-16">
        <div className="container text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-sans" style={{ color: "#f4c27a" }}>
            Get in Touch
          </h1>
          <p className="text-xl max-w-2xl mx-auto font-sans" style={{ color: "#f4c27a", opacity: 0.9 }}>
            We'd love to hear from you! Visit us or reach out through any of our channels.
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16">
        <div className="container max-w-6xl mx-auto px-4">
          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Phone */}
            <div className="bg-white rounded-xl p-8 shadow-lg border" style={{ borderColor: "#f4c27a" }}>
              <div className="flex flex-col items-center text-center">
                <div className="p-4 rounded-full mb-4" style={{ backgroundColor: "#f4c27a" }}>
                  <Phone size={32} style={{ color: "#6a1b1a" }} />
                </div>
                <h3 className="text-xl font-bold mb-3 font-sans" style={{ color: "#6a1b1a" }}>Call Us</h3>
                <a 
                  href={`tel:${restaurantInfo.phone}`}
                  className="text-lg mb-2 hover:underline font-sans"
                  style={{ color: "#6a1b1a" }}
                >
                  {restaurantInfo.phone}
                </a>
                <p className="text-sm text-gray-600 font-sans">Available during operating hours</p>
              </div>
            </div>

            {/* Email */}
            <div className="bg-white rounded-xl p-8 shadow-lg border" style={{ borderColor: "#f4c27a" }}>
              <div className="flex flex-col items-center text-center">
                <div className="p-4 rounded-full mb-4" style={{ backgroundColor: "#f4c27a" }}>
                  <Mail size={32} style={{ color: "#6a1b1a" }} />
                </div>
                <h3 className="text-xl font-bold mb-3 font-sans" style={{ color: "#6a1b1a" }}>Email Us</h3>
                <a 
                  href={`mailto:${restaurantInfo.email}`}
                  className="text-lg mb-2 hover:underline font-sans"
                  style={{ color: "#6a1b1a" }}
                >
                  {restaurantInfo.email}
                </a>
                <p className="text-sm text-gray-600 font-sans">We reply within 24 hours</p>
              </div>
            </div>

            {/* Hours - Updated with new schedule */}
            <div className="bg-white rounded-xl p-8 shadow-lg border" style={{ borderColor: "#f4c27a" }}>
              <div className="flex flex-col items-center text-center">
                <div className="p-4 rounded-full mb-4" style={{ backgroundColor: "#f4c27a" }}>
                  <Clock size={32} style={{ color: "#6a1b1a" }} />
                </div>
                <h3 className="text-xl font-bold mb-3 font-sans" style={{ color: "#6a1b1a" }}>Opening Hours</h3>
                <div className="space-y-2 w-full">
                  {restaurantInfo.hours.map((hour) => (
                    <div key={hour.day} className="text-sm font-sans">
                      <p className="font-semibold" style={{ color: "#6a1b1a" }}>{hour.day}</p>
                      <p className={hour.time === "CLOSED" ? "text-red-600 font-bold" : "text-gray-600"}>
                        {hour.time}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-8 font-sans" style={{ color: "#6a1b1a" }}>Connect with Us </h2>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://www.facebook.com/profile.php?id=100063824688511"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-8 py-4 rounded-lg font-semibold transition-all hover:scale-105 font-sans"
                style={{ backgroundColor: "#1877F2", color: "white" }}
              >
                <Facebook size={24} />
                Facebook
              </a>
            </div>
          </div>

          {/* Map Section - Using original map links */}
          <div className="bg-white rounded-xl overflow-hidden shadow-lg border" style={{ borderColor: "#f4c27a" }}>
            <div className="w-full h-96">
              <iframe
                title="Tatun's Kambingan Location"
                width="100%"
                height="100%"
                frameBorder="0"
                src="https://maps.google.com/maps?q=Tatun's%20Kambingan,%20Tarlac%20City&t=&z=15&ie=UTF8&iwloc=&output=embed"
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
            
            <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <button
                onClick={() =>
                  window.open(
                    "https://maps.google.com/maps?q=Tatun's+Kambingan,+Tarlac+City",
                    "_blank"
                  )
                }
                className="px-6 py-3 rounded-lg font-semibold transition-all hover:opacity-90 font-sans"
                style={{ backgroundColor: "#f4c27a", color: "#6a1b1a" }}
              >
                Open in Google Maps
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}