import Header from "@/components/Header";

/**
 * About Page - Restaurant story and QR code generation guide
 * Design: Warm, informative layout with QR section
 */
export default function About() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/20 to-secondary/20 py-12">
        <div className="container text-center">
          <h1 className="text-4xl font-bold mb-4 text-primary">Our Story</h1>
          <p className="text-lg text-muted-foreground">
            Discover the heritage and passion behind Tatun's Kambingan
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container max-w-2xl">
          {/* Story */}
          <div className="bg-card rounded-xl p-8 shadow-md mb-12">
            <h2 className="text-3xl font-bold mb-6 text-primary">
              Welcome to Tatun's Kambingan
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Tatun's Kambingan is a Filipino restaurant located in Tarlac City,
              Philippines, that specializes in authentic goat meat dishes. The
              restaurant is popular for specialties such as Kaldereta (stew) and
              Kampukan, and it also serves other Filipino dishes like Beef
              Kare-Kare and beef steak.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              It is known for being a "must-visit" for food lovers seeking
              traditional Filipino cuisine. Our commitment is to preserve and
              celebrate the rich flavors of Filipino heritage through every dish
              we serve.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Each recipe is crafted with care, using traditional cooking methods
              and the finest ingredients. We believe that authentic Filipino food
              brings people together and creates memorable dining experiences.
            </p>
          </div>

          {/* Specialties */}
          <div className="mb-12">
            <h2 className="section-header mb-6">Our Specialties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-xl font-bold text-primary mb-2">
                  Kaldereta
                </h3>
                <p className="text-muted-foreground">
                  Goat meat stew with potatoes, carrots, and tomato sauce. A
                  rich and savory dish.
                </p>
              </div>
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-xl font-bold text-primary mb-2">
                  Kampukan
                </h3>
                <p className="text-muted-foreground">
                  Goat meat stew with liver and other offal, cooked in a rich
                  broth. A house specialty.
                </p>
              </div>
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-xl font-bold text-primary mb-2">
                  Beef Kare-Kare
                </h3>
                <p className="text-muted-foreground">
                  Beef and vegetables in a rich peanut sauce. Served with
                  bagoong (shrimp paste).
                </p>
              </div>
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-xl font-bold text-primary mb-2">
                  Crispy Pork Sisig
                </h3>
                <p className="text-muted-foreground">
                  Chopped pork with liver and spices, cooked until crispy.
                  Served sizzling hot.
                </p>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="bg-gradient-to-br from-secondary/20 to-primary/20 rounded-xl p-8 border-2 border-secondary/30">
            <h2 className="section-header mb-6">Share This Website</h2>
            
            <div className="mb-8">
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Want to generate a QR code that points to this website? Follow
                these simple steps:
              </p>
              <ol className="space-y-4 text-muted-foreground">
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    1
                  </span>
                  <span>
                    Visit a QR code generator website like{" "}
                    <a
                      href="https://www.qr-code-generator.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-semibold hover:underline"
                    >
                      QR Code Generator
                    </a>
                    {" "}or{" "}
                    <a
                      href="https://qr.io"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-semibold hover:underline"
                    >
                      QR.io
                    </a>
                  </span>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    2
                  </span>
                  <span>
                    Enter the URL:{" "}
                    <code className="bg-card px-2 py-1 rounded font-mono text-sm">
                      https://yourdomain.com
                    </code>
                  </span>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    3
                  </span>
                  <span>
                    Customize the design (colors, logo) to match your brand
                  </span>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    4
                  </span>
                  <span>
                    Download the QR code as PNG or SVG and use it on menus,
                    posters, and social media
                  </span>
                </li>
              </ol>
            </div>

            <div className="bg-card rounded-lg p-6">
              <h3 className="font-bold mb-3">Quick Links:</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://www.qr-code-generator.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    → QR Code Generator
                  </a>
                </li>
                <li>
                  <a
                    href="https://qr.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    → QR.io
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.canva.com/create/qr-codes/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    → Canva QR Code Maker
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
