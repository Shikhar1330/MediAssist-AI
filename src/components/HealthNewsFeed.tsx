import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Newspaper, Search, Clock, User, ExternalLink, Bookmark, Tag, Calendar, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { askGemini, getGeminiApiKey } from "@/services/geminiService";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import LoadingAnimation from "./LoadingAnimation";

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  source: string;
  publishedAt: string;
  url: string;
  imageUrl: string;
  category: string;
  keywords: string[];
}

// Health news categories
const categories = [
  "Latest",
  "COVID-19",
  "Research",
  "Nutrition",
  "Mental Health",
  "Women's Health",
  "Men's Health",
  "Pediatrics",
  "Fitness",
  "Technology",
];

const HealthNewsFeed = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Latest");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [savedArticles, setSavedArticles] = useState<string[]>([]);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [apiKey, setApiKey] = useState(getGeminiApiKey());

  // Load saved articles from localStorage on component mount
  useEffect(() => {
    const savedArticlesIds = localStorage.getItem('savedNewsArticles');
    if (savedArticlesIds) {
      try {
        setSavedArticles(JSON.parse(savedArticlesIds));
      } catch (error) {
        console.error('Failed to parse saved articles:', error);
      }
    }
  }, []);
  
  // Save articles to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('savedNewsArticles', JSON.stringify(savedArticles));
  }, [savedArticles]);

  useEffect(() => {
    const fetchHealthNews = async () => {
      if (!getGeminiApiKey()) {
        setApiKeyDialogOpen(true);
        return;
      }

      setIsLoading(true);
      try {
        const prompt = `Generate 10 realistic but fictional health news articles for a health app. For each article, include:

        1. A title
        2. A summary (2-3 sentences)
        3. Main content (3-4 paragraphs)
        4. Author name
        5. Source name (health publication)
        6. Published date (within the last month)
        7. A fake URL
        8. A category from this list: COVID-19, Research, Nutrition, Mental Health, Women's Health, Men's Health, Pediatrics, Fitness, Technology
        9. 3-5 keywords related to the article
        
        Return the data as a valid JSON array with these keys: title, summary, content, author, source, publishedAt (ISO format), url, imageUrl (just use a placeholder URL), category, and keywords (array). Make these articles realistic and informative but fictional - NO REAL LINKS OR SOURCES.`;

        const response = await askGemini(prompt);
        
        // Extract JSON from the response
        const cleanJsonResponse = response.replace(/```json|```/g, '').trim();
        
        try {
          // Parse the news data and add IDs
          const newsData = JSON.parse(cleanJsonResponse);
          const articlesWithIds = newsData.map((article: any) => ({
            ...article,
            id: crypto.randomUUID()
          }));
          
          setArticles(articlesWithIds);
          setFilteredArticles(articlesWithIds);
          toast.success("Health news loaded successfully");
        } catch (parseError) {
          console.error("Error parsing news data:", parseError);
          
          // Fallback with sample data if JSON parsing fails
          const sampleArticles = generateSampleArticles();
          setArticles(sampleArticles);
          setFilteredArticles(sampleArticles);
          toast.success("Sample health news loaded");
        }
      } catch (error) {
        console.error("Error fetching health news:", error);
        const sampleArticles = generateSampleArticles();
        setArticles(sampleArticles);
        setFilteredArticles(sampleArticles);
        toast.info("Using sample health news");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHealthNews();
  }, []);

  // Generate sample articles as fallback
  const generateSampleArticles = (): NewsArticle[] => {
    return [
      {
        id: crypto.randomUUID(),
        title: "New Research Shows Benefits of Mediterranean Diet for Heart Health",
        summary: "A recent study confirms the Mediterranean diet significantly reduces risk of cardiovascular disease. Researchers found participants following the diet had 30% lower risk of heart attacks and strokes.",
        content: "Researchers at the Global Health Institute have published findings from a 10-year study on dietary patterns and heart health. The extensive research involved over 12,000 participants across multiple countries.\n\nParticipants who closely followed a Mediterranean diet rich in olive oil, nuts, fruits, vegetables, and fish showed markedly improved cardiovascular markers. Blood pressure, cholesterol levels, and inflammatory markers all showed significant improvement compared to control groups.\n\nDr. Elena Martinez, lead researcher on the study, emphasized that consistency was key to the results. \"We observed that participants who maintained the diet for at least 70% of their meals saw the greatest benefits. Even partial adherence showed some improvement in health markers.\"\n\nThe study also noted that combining the Mediterranean diet with regular physical activity amplified the protective effects, suggesting a synergistic relationship between diet and exercise for optimal heart health.",
        author: "Dr. Michael Chen",
        source: "Health Research Today",
        publishedAt: "2025-04-28T08:30:00Z",
        url: "https://example.com/mediterranean-diet-study",
        imageUrl: "https://images.unsplash.com/photo-1526470498-9ae73c665de8?w=800&h=500&fit=crop",
        category: "Nutrition",
        keywords: ["Mediterranean diet", "heart health", "cardiovascular", "nutrition research", "healthy eating"]
      },
      {
        id: crypto.randomUUID(),
        title: "Breakthrough in Early Alzheimer's Detection Shows Promise",
        summary: "Scientists develop a new blood test that can detect Alzheimer's disease up to 15 years before symptoms appear. The test identifies specific protein markers associated with neurological changes.",
        content: "A team of neuroscientists at Cambridge University has developed a revolutionary blood test capable of detecting Alzheimer's disease in its earliest stages. The test identifies specific protein markers associated with neurological changes that occur years before clinical symptoms manifest.\n\nThe blood test measures levels of phosphorylated tau proteins and amyloid beta ratios, which are key indicators of the disease process. In clinical trials involving 2,500 participants, the test demonstrated 94% accuracy in predicting which patients would develop Alzheimer's within the following decade.\n\n\"This breakthrough could transform how we approach Alzheimer's treatment,\" explained Dr. Sarah Williams, the study's principal investigator. \"By identifying at-risk individuals before brain damage occurs, we can implement interventions when they're most likely to be effective.\"\n\nThe researchers are now working with regulatory agencies to make the test widely available within two years. They believe early detection could significantly improve outcomes for millions of patients worldwide and accelerate research into preventative treatments.",
        author: "Jennifer Roberts",
        source: "Medical Innovations Quarterly",
        publishedAt: "2025-05-01T14:15:00Z",
        url: "https://example.com/alzheimers-early-detection",
        imageUrl: "https://images.unsplash.com/photo-1576086135878-55f57ff5de30?w=800&h=500&fit=crop",
        category: "Research",
        keywords: ["Alzheimer's", "neurological research", "early detection", "blood test", "brain health"]
      },
      {
        id: crypto.randomUUID(),
        title: "COVID-19 Variant Update: What You Need to Know About New Strains",
        summary: "Health officials provide guidance on emerging COVID-19 variants for this season. New strains show increased transmissibility but generally milder symptoms in vaccinated populations.",
        content: "The World Health Organization has released updated guidance regarding several new COVID-19 variants that have emerged this spring. The variants, collectively known as the XE series, demonstrate greater transmissibility than previous strains but appear to cause less severe illness in most healthy, vaccinated individuals.\n\nDr. James Park, infectious disease specialist at Central Hospital, explained that current vaccines still provide significant protection. \"Our data suggests that fully vaccinated individuals maintain about 78% protection against infection and over 90% protection against severe disease, even with these new variants.\"\n\nSymptoms of the new variants include headache, fatigue, and sore throat, with fewer patients reporting loss of taste or smell compared to earlier variants. The incubation period has also shortened to approximately 3 days from exposure to symptom onset.\n\nPublic health officials continue to recommend vaccination, including appropriate boosters, as the best defense against serious illness. For high-risk individuals and in areas with elevated transmission rates, masking in crowded indoor settings is still advised.",
        author: "Dr. Rachel Kim",
        source: "Global Health Bulletin",
        publishedAt: "2025-04-15T09:45:00Z",
        url: "https://example.com/covid-variant-update",
        imageUrl: "https://images.unsplash.com/photo-1584118624012-df056829fbd0?w=800&h=500&fit=crop",
        category: "COVID-19",
        keywords: ["COVID-19", "coronavirus variants", "vaccination", "public health", "infectious disease"]
      }
    ];
  };

  // Filter articles based on selected category and search term
  useEffect(() => {
    let filtered = [...articles];
    
    // Filter by category if not "Latest"
    if (activeCategory !== "Latest") {
      filtered = filtered.filter(article => article.category === activeCategory);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.keywords.some(keyword => 
          keyword.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    
    setFilteredArticles(filtered);
  }, [activeCategory, searchTerm, articles]);

  const handleArticleClick = (article: NewsArticle) => {
    setSelectedArticle(article);
  };

  const closeArticle = () => {
    setSelectedArticle(null);
  };

  const toggleSaveArticle = (articleId: string) => {
    if (savedArticles.includes(articleId)) {
      setSavedArticles(savedArticles.filter(id => id !== articleId));
      toast.info("Removed from saved articles");
    } else {
      setSavedArticles([...savedArticles, articleId]);
      toast.success("Article saved for later");
    }
  };

  const handleApiKeySave = () => {
    if (!apiKey.trim()) {
      toast.error("Please enter a valid API key");
      return;
    }

    // Save API key
    localStorage.setItem("geminiApiKey", apiKey);
    setApiKeyDialogOpen(false);
    toast.success("API key saved successfully");
    
    // Reload the page to trigger the news fetch
    window.location.reload();
  };

  // Format the date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-6 w-6" />
            <span>Health News Feed</span>
          </CardTitle>
          <CardDescription className="text-white text-opacity-90">
            Stay informed with the latest health news and research
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                <TabsList className="overflow-auto">
                  {categories.map((category) => (
                    <TabsTrigger key={category} value={category}>
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <LoadingAnimation />
                <p className="mt-4 text-sm text-gray-500">Loading latest health news...</p>
              </div>
            ) : (
              <>
                {filteredArticles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredArticles.map((article) => (
                      <Card 
                        key={article.id} 
                        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => handleArticleClick(article)}
                      >
                        <div 
                          className="h-48 bg-gray-200 bg-cover bg-center" 
                          style={{ 
                            backgroundImage: `url(${article.imageUrl || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=500&fit=crop'})` 
                          }}
                        ></div>
                        <CardContent className="pt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-blue-100 hover:bg-blue-100 text-blue-800">
                              {article.category}
                            </Badge>
                            <span className="text-xs text-gray-500 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatDate(article.publishedAt)}
                            </span>
                          </div>
                          
                          <h3 className="font-semibold text-lg line-clamp-2 mb-2">
                            {article.title}
                          </h3>
                          
                          <p className="text-gray-600 line-clamp-3 text-sm mb-3">
                            {article.summary}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              <span>{article.author}</span>
                            </div>
                            <span>{article.source}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-2">No articles found matching your criteria.</p>
                    <Button variant="link" onClick={() => {
                      setSearchTerm("");
                      setActiveCategory("Latest");
                    }}>
                      Reset filters
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Article Detail Modal */}
      {selectedArticle && (
        <Dialog open={!!selectedArticle} onOpenChange={() => closeArticle()}>
          <DialogContent className="max-w-3xl p-0 overflow-hidden">
            <div 
              className="h-60 bg-gray-200 bg-cover bg-center relative" 
              style={{ 
                backgroundImage: `url(${selectedArticle.imageUrl || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=500&fit=crop'})` 
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                <Badge className="self-start mb-3 bg-blue-500">
                  {selectedArticle.category}
                </Badge>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {selectedArticle.title}
                </h2>
                <div className="flex items-center gap-4 text-white/80 text-sm">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span>{selectedArticle.author}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{formatDate(selectedArticle.publishedAt)}</span>
                  </div>
                  <div>{selectedArticle.source}</div>
                </div>
              </div>
            </div>
            
            <ScrollArea className="max-h-[60vh] p-6">
              <div className="mb-6">
                <h3 className="font-semibold text-lg text-gray-800 mb-3">Summary</h3>
                <p className="text-gray-600">{selectedArticle.summary}</p>
              </div>
              
              <div className="prose max-w-none">
                {selectedArticle.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-2 mt-6">
                <div className="flex items-center mr-2">
                  <Tag className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="text-sm text-gray-500">Keywords:</span>
                </div>
                {selectedArticle.keywords.map((keyword, index) => (
                  <Badge key={index} variant="outline">
                    {keyword}
                  </Badge>
                ))}
              </div>
              
              <div className="flex justify-between items-center mt-6 pt-4 border-t">
                <div className="flex items-center text-sm text-gray-500">
                  <TrendingUp className="h-4 w-4 mr-1 text-blue-500" />
                  <span>Trending in {selectedArticle.category}</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSaveArticle(selectedArticle.id);
                    }}
                  >
                    <Bookmark 
                      className={`h-4 w-4 mr-2 ${savedArticles.includes(selectedArticle.id) ? "fill-current" : ""}`} 
                    />
                    {savedArticles.includes(selectedArticle.id) ? "Saved" : "Save"}
                  </Button>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Read Full Article
                  </Button>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <h3 className="font-semibold mb-2">Related Articles</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {articles
                    .filter(a => a.id !== selectedArticle.id && a.category === selectedArticle.category)
                    .slice(0, 3)
                    .map(article => (
                      <Card 
                        key={article.id} 
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedArticle(article);
                        }}
                      >
                        <CardContent className="p-3">
                          <h4 className="font-medium text-sm line-clamp-2">{article.title}</h4>
                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{formatDate(article.publishedAt)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  }
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
      
      <Dialog open={apiKeyDialogOpen} onOpenChange={setApiKeyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Gemini API Key</DialogTitle>
            <DialogDescription>
              This key is required to generate health news. You can get an API key from the Google AI Studio.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter your Gemini API key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Your API key is only stored in your browser and is never sent to our servers.
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setApiKeyDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleApiKeySave}>
                Save & Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HealthNewsFeed;
