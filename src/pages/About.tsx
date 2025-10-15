import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Globe, Users, BookOpen, ExternalLink } from "lucide-react";
import { SiKofi, SiPatreon } from "react-icons/si";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent text-center">
            Our Story
          </h1>

          <div className="prose prose-invert max-w-none mb-12">
            <Card className="bg-gradient-card border-border/50 mb-8">
              <CardContent className="p-8">
                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  I am starting a manga localization project to help upcoming Japanese manga artists gain traction in English-speaking territories. I love reading manga and have seen many series stop getting translated due to low demand. My goal is to collaborate with talented aspiring mangakas and help them reach a wider audience.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Every story deserves to be told, and every artist deserves the opportunity to share their vision with the world. Through professional localization and dedicated support, we're building a bridge between Japanese creators and English-speaking readers.
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <Card className="bg-secondary/30 border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-primary rounded-lg">
                      <Globe className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold">Our Mission</h3>
                  </div>
                  <p className="text-muted-foreground">
                    To provide a platform where aspiring Japanese manga artists can share their work with English-speaking audiences through high-quality localization.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-secondary/30 border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-primary rounded-lg">
                      <Users className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold">Our Community</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Building a supportive community of readers and creators who appreciate quality manga and want to see talented artists succeed.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-secondary/30 border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-primary rounded-lg">
                      <BookOpen className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold">Quality First</h3>
                  </div>
                  <p className="text-muted-foreground">
                    We're committed to professional-grade translations and presentations that honor the original work while making it accessible to new audiences.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-secondary/30 border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-primary rounded-lg">
                      <Heart className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold">Passion Driven</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Every project we undertake is fueled by genuine love for manga and respect for the artists who create these incredible stories.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Support Section */}
          <Card className="bg-gradient-to-br from-primary/20 to-accent/20 border-primary/50 shadow-glow">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">Support Our Project</h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Your support helps us continue bringing amazing manga to English-speaking audiences and directly supports the talented artists we work with. Every contribution makes a difference.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity">
                  <a href="https://ko-fi.com" target="_blank" rel="noopener noreferrer">
                    <SiKofi className="h-5 w-5 mr-2" />
                    Support on Ko-fi
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </Button>
                
                <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  <a href="https://patreon.com" target="_blank" rel="noopener noreferrer">
                    <SiPatreon className="h-5 w-5 mr-2" />
                    Join on Patreon
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              </div>

              <p className="text-sm text-muted-foreground mt-6">
                All donations go towards localization costs, platform maintenance, and supporting our featured artists.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;
