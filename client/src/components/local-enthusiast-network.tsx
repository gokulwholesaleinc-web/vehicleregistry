import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  MapPin, 
  Calendar, 
  Star, 
  MessageCircle, 
  UserPlus,
  Search,
  Filter,
  Clock,
  Award,
  Wrench,
  Car,
  Navigation,
  Phone,
  Mail,
  ExternalLink
} from "lucide-react";

interface LocalUser {
  id: string;
  name: string;
  avatar: string;
  distance: number;
  vehicle: {
    make: string;
    model: string;
    year: number;
  };
  expertise: string[];
  rating: number;
  reviewCount: number;
  lastActive: string;
  isAvailable: boolean;
}

interface LocalEvent {
  id: string;
  title: string;
  type: "meetup" | "car_show" | "tech_session" | "cruise";
  date: string;
  time: string;
  location: string;
  distance: number;
  attendees: number;
  maxAttendees?: number;
  organizer: string;
  description: string;
  requiredSkills?: string[];
}

interface SkillShare {
  id: string;
  user: LocalUser;
  skill: string;
  description: string;
  hourlyRate?: number;
  availability: "available" | "busy" | "weekend_only";
  responseTime: string;
}

interface LocalEnthusiastNetworkProps {
  vehicleId?: string;
}

export default function LocalEnthusiastNetwork({ vehicleId }: LocalEnthusiastNetworkProps) {
  const [selectedTab, setSelectedTab] = useState("nearby");
  const [searchRadius, setSearchRadius] = useState(25);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("all");
  const [eventFilter, setEventFilter] = useState("all");

  // Mock data for local users
  const mockUsers: LocalUser[] = [
    {
      id: "1",
      name: "Mike Chen",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
      distance: 3.2,
      vehicle: { make: "Honda", model: "Civic Si", year: 2019 },
      expertise: ["Engine Tuning", "Suspension Setup", "Electrical"],
      rating: 4.8,
      reviewCount: 24,
      lastActive: "2 hours ago",
      isAvailable: true
    },
    {
      id: "2",
      name: "Sarah Rodriguez",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c3d3?w=100",
      distance: 7.1,
      vehicle: { make: "Subaru", model: "WRX STI", year: 2021 },
      expertise: ["Turbo Systems", "Performance Tuning", "Track Prep"],
      rating: 4.9,
      reviewCount: 31,
      lastActive: "1 day ago",
      isAvailable: true
    },
    {
      id: "3",
      name: "Alex Thompson",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      distance: 12.5,
      vehicle: { make: "BMW", model: "M3", year: 2020 },
      expertise: ["Bodywork", "Paint", "Aesthetics"],
      rating: 4.7,
      reviewCount: 18,
      lastActive: "3 hours ago",
      isAvailable: false
    },
    {
      id: "4",
      name: "Jessica Kim",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
      distance: 8.9,
      vehicle: { make: "Toyota", model: "86", year: 2022 },
      expertise: ["Interior Mods", "Audio Systems", "Lighting"],
      rating: 4.6,
      reviewCount: 12,
      lastActive: "5 hours ago",
      isAvailable: true
    }
  ];

  // Mock data for local events
  const mockEvents: LocalEvent[] = [
    {
      id: "1",
      title: "Japanese Car Meetup",
      type: "meetup",
      date: "2025-08-28",
      time: "7:00 PM",
      location: "Downtown Parking Garage",
      distance: 5.2,
      attendees: 23,
      maxAttendees: 50,
      organizer: "JDM Society",
      description: "Monthly meetup for Japanese car enthusiasts. All makes welcome!"
    },
    {
      id: "2",
      title: "Spring Car Show",
      type: "car_show",
      date: "2025-09-05",
      time: "10:00 AM",
      location: "Central Park Events Center",
      distance: 12.1,
      attendees: 156,
      maxAttendees: 200,
      organizer: "City Auto Club",
      description: "Annual spring car show with awards, vendors, and live music."
    },
    {
      id: "3",
      title: "Suspension Tuning Workshop",
      type: "tech_session",
      date: "2025-08-30",
      time: "2:00 PM",
      location: "Pro Garage",
      distance: 8.7,
      attendees: 8,
      maxAttendees: 15,
      organizer: "Mike Chen",
      description: "Learn proper suspension setup and alignment techniques.",
      requiredSkills: ["Basic Tools", "Mechanical Knowledge"]
    },
    {
      id: "4",
      title: "Mountain Canyon Cruise",
      type: "cruise",
      date: "2025-09-02",
      time: "8:00 AM",
      location: "Canyon Road Overlook",
      distance: 25.3,
      attendees: 12,
      maxAttendees: 20,
      organizer: "Weekend Warriors",
      description: "Scenic drive through mountain canyons. All skill levels welcome."
    }
  ];

  // Mock data for skill sharing
  const mockSkillShares: SkillShare[] = [
    {
      id: "1",
      user: mockUsers[0],
      skill: "ECU Tuning",
      description: "Professional ECU tuning with dyno testing. 10+ years experience.",
      hourlyRate: 85,
      availability: "available",
      responseTime: "< 1 hour"
    },
    {
      id: "2",
      user: mockUsers[1],
      skill: "Turbo Installation",
      description: "Complete turbo system installation and tuning. Subaru specialist.",
      hourlyRate: 95,
      availability: "weekend_only",
      responseTime: "< 4 hours"
    },
    {
      id: "3",
      user: mockUsers[3],
      skill: "Interior Customization",
      description: "Custom upholstery, trim work, and audio system installation.",
      hourlyRate: 65,
      availability: "available",
      responseTime: "< 2 hours"
    }
  ];

  const skills = ["all", "Engine Tuning", "Suspension Setup", "Bodywork", "Electrical", "Turbo Systems", "Interior Mods"];
  const eventTypes = ["all", "meetup", "car_show", "tech_session", "cruise"];

  const filteredUsers = mockUsers.filter(user => {
    const matchesRadius = user.distance <= searchRadius;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSkill = selectedSkill === "all" || user.expertise.includes(selectedSkill);
    return matchesRadius && matchesSearch && matchesSkill;
  });

  const filteredEvents = mockEvents.filter(event => {
    const matchesFilter = eventFilter === "all" || event.type === eventFilter;
    const matchesRadius = event.distance <= searchRadius;
    return matchesFilter && matchesRadius;
  });

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "meetup": return <Users className="w-4 h-4" />;
      case "car_show": return <Award className="w-4 h-4" />;
      case "tech_session": return <Wrench className="w-4 h-4" />;
      case "cruise": return <Navigation className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "available": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "busy": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
      case "weekend_only": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  return (
    <Card className="card-modern">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span>Local Enthusiast Network</span>
        </CardTitle>
        <CardDescription>
          Connect with nearby car enthusiasts, join events, and share knowledge
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="nearby">Nearby Users</TabsTrigger>
            <TabsTrigger value="events">Local Events</TabsTrigger>
            <TabsTrigger value="skills">Skill Sharing</TabsTrigger>
          </TabsList>

          <TabsContent value="nearby" className="space-y-6 mt-6">
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search-users">Search Users</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="search-users"
                    placeholder="Search by name or vehicle..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-users"
                  />
                </div>
              </div>
              <div className="sm:w-32">
                <Label htmlFor="radius">Radius: {searchRadius} mi</Label>
                <input
                  id="radius"
                  type="range"
                  min="5"
                  max="50"
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(Number(e.target.value))}
                  className="w-full"
                  data-testid="slider-search-radius"
                />
              </div>
              <div className="sm:w-48">
                <Label htmlFor="skill-filter">Expertise</Label>
                <select
                  id="skill-filter"
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                  data-testid="select-skill-filter"
                >
                  {skills.map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Users List */}
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="card-hover">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold truncate">{user.name}</h3>
                          <div className="flex items-center space-x-2">
                            {user.isAvailable && (
                              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                Available
                              </Badge>
                            )}
                            <span className="text-sm text-gray-500">{user.distance} mi</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="flex items-center space-x-1">
                            <Car className="w-4 h-4 text-blue-600" />
                            <span className="text-sm">
                              {user.vehicle.year} {user.vehicle.make} {user.vehicle.model}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm">{user.rating} ({user.reviewCount})</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mb-3">
                          {user.expertise.map(skill => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Last active: {user.lastActive}</span>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" data-testid={`button-message-${user.id}`}>
                              <MessageCircle className="w-4 h-4 mr-1" />
                              Message
                            </Button>
                            <Button size="sm" variant="outline" data-testid={`button-connect-${user.id}`}>
                              <UserPlus className="w-4 h-4 mr-1" />
                              Connect
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6 mt-6">
            {/* Event Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="sm:w-48">
                <Label htmlFor="event-filter">Event Type</Label>
                <select
                  id="event-filter"
                  value={eventFilter}
                  onChange={(e) => setEventFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                  data-testid="select-event-filter"
                >
                  {eventTypes.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 flex items-end">
                <Button className="btn-primary" data-testid="button-create-event">
                  <Calendar className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </div>
            </div>

            {/* Events List */}
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="card-hover">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <div className="text-blue-600 dark:text-blue-400">
                          {getEventTypeIcon(event.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{event.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            Organized by {event.organizer}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            {event.type.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{event.distance} mi</span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>{event.attendees}{event.maxAttendees && ` / ${event.maxAttendees}`}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {event.description}
                    </p>
                    
                    {event.requiredSkills && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        <span className="text-xs font-medium">Required:</span>
                        {event.requiredSkills.map(skill => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <Button size="sm" className="btn-primary" data-testid={`button-join-${event.id}`}>
                          Join Event
                        </Button>
                        <Button size="sm" variant="outline" data-testid={`button-details-${event.id}`}>
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6 mt-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Skill Sharing Network</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Connect with local experts who can help with specific modifications or repairs. All interactions are community-based.
              </p>
            </div>

            <div className="space-y-4">
              {mockSkillShares.map((skillShare) => (
                <Card key={skillShare.id} className="card-hover">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={skillShare.user.avatar} alt={skillShare.user.name} />
                        <AvatarFallback>{skillShare.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-semibold">{skillShare.user.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{skillShare.skill}</p>
                          </div>
                          <div className="text-right">
                            {skillShare.hourlyRate && (
                              <p className="font-semibold text-green-600">${skillShare.hourlyRate}/hr</p>
                            )}
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm">{skillShare.user.rating}</span>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {skillShare.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Badge className={getAvailabilityColor(skillShare.availability)}>
                              {skillShare.availability.replace('_', ' ')}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              Responds {skillShare.responseTime}
                            </span>
                            <span className="text-xs text-gray-500">
                              {skillShare.user.distance} mi away
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" data-testid={`button-contact-${skillShare.id}`}>
                              <Phone className="w-4 h-4 mr-1" />
                              Contact
                            </Button>
                            <Button size="sm" variant="outline" data-testid={`button-request-help-${skillShare.id}`}>
                              <Wrench className="w-4 h-4 mr-1" />
                              Request Help
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Offer Your Skills */}
            <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
              <CardContent className="p-6 text-center">
                <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Share Your Expertise</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Help other enthusiasts and earn extra income by offering your skills
                </p>
                <Button className="btn-primary" data-testid="button-offer-skills">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Offer Your Skills
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}