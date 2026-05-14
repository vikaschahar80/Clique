import { useState } from 'react';
import { Users, MapPin, Calendar, Search, Star, TrendingUp } from 'lucide-react';


const categories = ['All', 'Sports', 'Food & Drink', 'Arts & Culture', 'Fitness', 'Tech', 'Social'];

const mockGroups = [
  {
    id: 1,
    name: 'Weekend Hikers Club',
    image: 'https://images.unsplash.com/photo-1722410141874-5494d14deeca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncm91cCUyMHBlb3BsZSUyMGhpa2luZyUyMG91dGRvb3J8ZW58MXx8fHwxNzcwMzEyMjU1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Join us for scenic hikes every weekend. All fitness levels welcome!',
    members: 234,
    category: 'Sports',
    location: 'Various trails nearby',
    nextEvent: 'Saturday, 9:00 AM',
    isPopular: true,
    isTrending: true,
  },
  {
    id: 2,
    name: 'Culinary Explorers',
    image: 'https://images.unsplash.com/photo-1753392785049-1bf269637ecc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZW9wbGUlMjBjb29raW5nJTIwdG9nZXRoZXIlMjBraXRjaGVufGVufDF8fHx8MTc3MDMxMjI1NXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Love cooking? Join our group cooking sessions and learn new recipes!',
    members: 187,
    category: 'Food & Drink',
    location: 'Community Kitchen, Downtown',
    nextEvent: 'Friday, 6:30 PM',
    isPopular: true,
    isTrending: false,
  },
  {
    id: 3,
    name: 'Morning Yoga Squad',
    image: 'https://images.unsplash.com/photo-1760774714285-61ff516f86c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwY2xhc3MlMjBncm91cCUyMGZpdG5lc3N8ZW58MXx8fHwxNzcwMzEyMjU1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Start your day with mindfulness and movement in our yoga sessions.',
    members: 156,
    category: 'Fitness',
    location: 'Central Park',
    nextEvent: 'Daily, 7:00 AM',
    isPopular: false,
    isTrending: true,
  },
  {
    id: 4,
    name: 'Book Lovers Society',
    image: 'https://images.unsplash.com/photo-1763896081109-ed6bf56ae955?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rJTIwY2x1YiUyMHJlYWRpbmclMjBncm91cHxlbnwxfHx8fDE3NzAyOTYyOTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Monthly book discussions and literary adventures with fellow readers.',
    members: 298,
    category: 'Arts & Culture',
    location: 'The Bookshelf Cafe',
    nextEvent: 'Next Sunday, 3:00 PM',
    isPopular: true,
    isTrending: false,
  },
  {
    id: 5,
    name: 'Photo Walk Club',
    image: 'https://images.unsplash.com/photo-1610219201631-6dfded82e8d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaG90b2dyYXBoeSUyMGdyb3VwJTIwY2FtZXJhfGVufDF8fHx8MTc3MDMxMjI1Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Capture the beauty around us! Weekly photo walks for all skill levels.',
    members: 142,
    category: 'Arts & Culture',
    location: 'City landmarks',
    nextEvent: 'Sunday, 10:00 AM',
    isPopular: false,
    isTrending: true,
  },
  {
    id: 6,
    name: 'Gaming Hangout',
    image: 'https://images.unsplash.com/photo-1758179765099-55dcc9398643?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBlc3BvcnRzJTIwZnJpZW5kc3xlbnwxfHx8fDE3NzAzMTIyNTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Connect with fellow gamers for tournaments and casual gaming sessions.',
    members: 412,
    category: 'Tech',
    location: 'GameZone Arena',
    nextEvent: 'Every evening',
    isPopular: true,
    isTrending: true,
  },
  {
    id: 7,
    name: 'Wine Tasting Circle',
    image: 'https://images.unsplash.com/photo-1767510533093-ffb6421a002d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aW5lJTIwdGFzdGluZyUyMHNvY2lhbHxlbnwxfHx8fDE3NzAyMDk5NTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Explore fine wines and expand your palate with like-minded enthusiasts.',
    members: 165,
    category: 'Food & Drink',
    location: 'Various wineries',
    nextEvent: 'Next Saturday, 5:00 PM',
    isPopular: false,
    isTrending: false,
  },
  {
    id: 8,
    name: 'Run Club',
    image: 'https://images.unsplash.com/photo-1560073744-7643b964bdf8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydW5uaW5nJTIwZ3JvdXAlMjBhdGhsZXRlc3xlbnwxfHx8fDE3NzAzMTIyNTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Weekly running group for beginners to advanced runners. Stay fit together!',
    members: 276,
    category: 'Fitness',
    location: 'City Running Trail',
    nextEvent: 'Wednesday, 6:00 PM',
    isPopular: true,
    isTrending: false,
  },
];

export function Groups() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGroups = mockGroups.filter((group) => {
    const matchesCategory = selectedCategory === 'All' || group.category === selectedCategory;
    const matchesSearch =
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <Users className="size-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold">Discover Groups</h2>
            <p className="text-gray-600">Find your tribe and make meaningful connections</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search groups by name or interest..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
              selectedCategory === category
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Featured Groups */}
      {selectedCategory === 'All' && (
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="size-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Trending Groups</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockGroups
              .filter((group) => group.isTrending)
              .slice(0, 3)
              .map((group) => (
                <div
                  key={group.id}
                  className="bg-white rounded-lg p-3 border border-cyan-200 hover:shadow-md transition-shadow"
                >
                  <h4 className="font-semibold text-sm mb-1">{group.name}</h4>
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <Users className="size-3" />
                    {group.members} members
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredGroups.map((group) => (
          <div
            key={group.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Group Image */}
            <div className="relative">
              <img
                src={group.image}
                alt={group.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-3 right-3 flex gap-2">
                {group.isPopular && (
                  <span className="bg-yellow-400 text-yellow-900 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                    <Star className="size-3 fill-yellow-900" />
                    Popular
                  </span>
                )}
                {group.isTrending && (
                  <span className="bg-cyan-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                    <TrendingUp className="size-3" />
                    Trending
                  </span>
                )}
              </div>
              <div className="absolute top-3 left-3">
                <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
                  {group.category}
                </span>
              </div>
            </div>

            {/* Group Info */}
            <div className="p-5">
              <h3 className="font-bold text-lg mb-2">{group.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{group.description}</p>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="size-4 text-cyan-600" />
                  <span>{group.members} members</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="size-4 text-cyan-600" />
                  <span>{group.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="size-4 text-cyan-600" />
                  <span>{group.nextEvent}</span>
                </div>
              </div>

              {/* Join Button */}
              <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2.5 rounded-lg hover:opacity-90 transition-opacity font-medium">
                Join Group
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <div className="text-center py-12">
          <Users className="size-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No groups found matching your criteria</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}