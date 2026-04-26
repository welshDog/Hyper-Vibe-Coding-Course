import { useState, useEffect } from 'react';
import { 
  Activity, 
  GitBranch, 
  Users, 
  Package, 
  TrendingUp, 
  Clock,
  Search,
  Cpu,
  Database,
  BookOpen,
  BarChart3,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MetricCard } from './components/MetricCard';
import { ResourceChart } from './components/ResourceChart';
import { ActivityFeed } from './components/ActivityFeed';
import { SearchBar } from './components/SearchBar';
import './App.css';

// Mock data for the dashboard
const mockMetrics = {
  totalResources: 15420,
  resourcesGrowth: 12.5,
  activeUsers: 8934,
  usersGrowth: 23.1,
  dailyClones: 1247,
  clonesGrowth: 8.7,
  avgResolutionTime: 2.4,
  resolutionImprovement: 15.3,
  testPassRate: 98.7,
  coverage: 87.3
};

const resourceStats = {
  frameworks: 342,
  models: 8234,
  datasets: 4521,
  tutorials: 1567,
  benchmarks: 756
};

const recentActivity = [
  { id: 1, type: 'resource', message: 'New model added: GPT-4 Turbo', time: '2 min ago', icon: Cpu },
  { id: 2, type: 'pr', message: 'PR #1247 merged: Update PyTorch metadata', time: '15 min ago', icon: GitBranch },
  { id: 3, type: 'user', message: 'New contributor: @ai-researcher', time: '1 hour ago', icon: Users },
  { id: 4, type: 'test', message: 'All tests passed for v2.1.0', time: '2 hours ago', icon: CheckCircle2 },
  { id: 5, type: 'issue', message: 'Issue #892 resolved: Compatibility fix', time: '3 hours ago', icon: AlertCircle },
];

const topResources = [
  { name: 'PyTorch', category: 'Framework', downloads: '2.4M', trend: '+15%' },
  { name: 'BERT Base', category: 'Model', downloads: '1.8M', trend: '+8%' },
  { name: 'TensorFlow', category: 'Framework', downloads: '1.5M', trend: '+5%' },
  { name: 'ResNet-50', category: 'Model', downloads: '980K', trend: '+12%' },
  { name: 'Hugging Face', category: 'Framework', downloads: '890K', trend: '+28%' },
];

function App() {
  const [metrics, setMetrics] = useState(mockMetrics);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-slate-400">Loading AI Hub Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  AI Hub Dashboard
                </h1>
                <p className="text-xs text-slate-400">The World's Largest AI Resource Repository</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <SearchBar />
              <Badge variant="outline" className="border-green-500/50 text-green-400">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2"></span>
                Live
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Total Resources"
            value={metrics.totalResources.toLocaleString()}
            change={`+${metrics.resourcesGrowth}%`}
            icon={Package}
            color="blue"
          />
          <MetricCard
            title="Active Users"
            value={metrics.activeUsers.toLocaleString()}
            change={`+${metrics.usersGrowth}%`}
            icon={Users}
            color="purple"
          />
          <MetricCard
            title="Daily Clones"
            value={metrics.dailyClones.toLocaleString()}
            change={`+${metrics.clonesGrowth}%`}
            icon={GitBranch}
            color="green"
          />
          <MetricCard
            title="Avg Resolution Time"
            value={`${metrics.avgResolutionTime}d`}
            change={`-${metrics.resolutionImprovement}%`}
            icon={Clock}
            color="orange"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700/50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">
              <Activity className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="resources" className="data-[state=active]:bg-blue-600">
              <Database className="w-4 h-4 mr-2" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="quality" className="data-[state=active]:bg-blue-600">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Quality
            </TabsTrigger>
            <TabsTrigger value="community" className="data-[state=active]:bg-blue-600">
              <Users className="w-4 h-4 mr-2" />
              Community
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Resource Distribution */}
              <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    Resource Distribution
                  </CardTitle>
                  <CardDescription>Breakdown by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResourceChart data={resourceStats} />
                </CardContent>
              </Card>

              {/* Activity Feed */}
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-400" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Latest updates from the hub</CardDescription>
                </CardHeader>
                <CardContent>
                  <ActivityFeed activities={recentActivity} />
                </CardContent>
              </Card>
            </div>

            {/* Top Resources */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Top Resources
                </CardTitle>
                <CardDescription>Most popular resources this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700/50">
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Resource</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Category</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Downloads</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topResources.map((resource, idx) => (
                        <tr key={idx} className="border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors">
                          <td className="py-3 px-4 font-medium">{resource.name}</td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="border-slate-600">
                              {resource.category}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">{resource.downloads}</td>
                          <td className="py-3 px-4">
                            <span className="text-green-400 flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              {resource.trend}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Frameworks</p>
                      <p className="text-2xl font-bold">{resourceStats.frameworks}</p>
                    </div>
                    <Cpu className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Models</p>
                      <p className="text-2xl font-bold">{resourceStats.models.toLocaleString()}</p>
                    </div>
                    <Database className="w-8 h-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Datasets</p>
                      <p className="text-2xl font-bold">{resourceStats.datasets.toLocaleString()}</p>
                    </div>
                    <Package className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Tutorials</p>
                      <p className="text-2xl font-bold">{resourceStats.tutorials.toLocaleString()}</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-orange-400" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Benchmarks</p>
                      <p className="text-2xl font-bold">{resourceStats.benchmarks}</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-pink-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="quality" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle>Test Coverage</CardTitle>
                  <CardDescription>Code coverage across the repository</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Unit Tests</span>
                        <span className="text-sm font-medium">92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Integration Tests</span>
                        <span className="text-sm font-medium">87%</span>
                      </div>
                      <Progress value={87} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">AI Autonomy Tests</span>
                        <span className="text-sm font-medium">98%</span>
                      </div>
                      <Progress value={98} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle>CI/CD Status</CardTitle>
                  <CardDescription>Pipeline health metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span>Metadata Validation</span>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400">Passing</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span>Compatibility Checks</span>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400">Passing</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        <span>Security Scan</span>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400">Passing</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="community" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-center">Contributors</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-4xl font-bold text-blue-400">2,847</p>
                  <p className="text-slate-400 mt-2">Active contributors</p>
                  <p className="text-green-400 text-sm mt-1">+156 this month</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-center">Pull Requests</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-4xl font-bold text-purple-400">1,234</p>
                  <p className="text-slate-400 mt-2">Merged this month</p>
                  <p className="text-green-400 text-sm mt-1">98% merge rate</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-center">Issues</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-4xl font-bold text-orange-400">89</p>
                  <p className="text-slate-400 mt-2">Open issues</p>
                  <p className="text-green-400 text-sm mt-1">Avg 2.4 days to resolve</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              <span className="font-semibold">AI Hub</span>
            </div>
            <p className="text-slate-400 text-sm">
              The world's largest, most authoritative AI resource repository
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition-colors">Documentation</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
              <a href="#" className="hover:text-white transition-colors">API</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;