import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// Helper functions for report generation
const generateDocumentReportCSV = (data: any) => {
  const headers = ['Category', 'Document Count', 'Percentage', 'Storage Used'];
  const rows = data.documentsByCategory.map((cat: any) => [
    cat.name,
    cat.count,
    `${cat.percentage}%`,
    `${(cat.percentage / 100 * data.storageUsed).toFixed(2)} GB`
  ]);

  return [headers, ...rows].map(row => row.join(',')).join('\n');
};

const generateActivityReportCSV = (data: any) => {
  const headers = ['Teacher Name', 'Uploads', 'Downloads', 'Status'];
  const rows = data.topContributors.map((teacher: any) => [
    teacher.name,
    teacher.uploads,
    teacher.downloads,
    'Active'
  ]);

  return [headers, ...rows].map(row => row.join(',')).join('\n');
};

const generateStorageReportCSV = (data: any) => {
  const headers = ['Category', 'Storage Used', 'Percentage'];
  const rows = data.storageByCategory.map((item: any) => [
    item.category,
    item.usage,
    `${item.percentage}%`
  ]);

  return [headers, ...rows].map(row => row.join(',')).join('\n');
};

const generateComprehensiveReportCSV = (data: any) => {
  let csvContent = `Comprehensive Analytics Report\n`;
  csvContent += `Generated: ${new Date(data.generatedDate).toLocaleString()}\n`;
  csvContent += `Time Range: Last ${data.timeRange} days\n\n`;

  // Summary section
  csvContent += `SUMMARY\n`;
  csvContent += `Total Users,${data.summary.totalUsers}\n`;
  csvContent += `Active Users,${data.summary.activeUsers}\n`;
  csvContent += `Total Documents,${data.summary.totalDocuments}\n`;
  csvContent += `Total Downloads,${data.summary.totalDownloads}\n`;
  csvContent += `Storage Used,${data.summary.storageUsed} GB\n\n`;

  // Categories section
  csvContent += `DOCUMENT CATEGORIES\n`;
  csvContent += `Category,Document Count,Percentage\n`;
  data.categories.forEach((cat: any) => {
    csvContent += `${cat.name},${cat.count},${cat.percentage}%\n`;
  });

  csvContent += `\nTOP CONTRIBUTORS\n`;
  csvContent += `Teacher Name,Uploads,Downloads\n`;
  data.topUsers.forEach((user: any) => {
    csvContent += `${user.name},${user.uploads},${user.downloads}\n`;
  });

  return csvContent;
};

const downloadCSV = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { 
  BarChart3, 
  Download, 
  TrendingUp,
  Users,
  FileText,
  Share,
  Calendar,
  PieChart,
  Activity,
  Clock
} from 'lucide-react';

export default function AdminReports() {
  const [timeRange, setTimeRange] = useState('30');

  const handleDocumentReport = () => {
    // Generate and download detailed document usage report
    const reportData = {
      reportType: 'Document Usage Analysis',
      generatedDate: new Date().toISOString(),
      totalDocuments: analytics.totalDocuments,
      documentsByCategory: analytics.popularCategories,
      uploadTrends: analytics.monthlyUploads,
      storageBreakdown: {
        totalStorage: `${analytics.storageUsed} GB`,
        averageFileSize: '2.1 MB',
        largestFiles: [
          { name: 'Complete Mathematics Curriculum.pdf', size: '15.2 MB', teacher: 'Jane Mwangi' },
          { name: 'Annual Assessment Report.xlsx', size: '12.8 MB', teacher: 'John Kiprotich' },
          { name: 'Student Progress Database.csv', size: '8.4 MB', teacher: 'Mary Ochieng' }
        ]
      }
    };

    // Create and download CSV report
    const csvContent = generateDocumentReportCSV(reportData);
    downloadCSV(csvContent, 'document-usage-report.csv');

    toast.success('Report Generated', {
      description: 'Document usage report has been downloaded successfully'
    });
  };

  const handleUserActivityReport = () => {
    // Generate teacher engagement and activity report
    const activityData = {
      reportType: 'Teacher Engagement Report',
      generatedDate: new Date().toISOString(),
      totalUsers: analytics.totalUsers,
      activeUsers: analytics.activeUsers,
      topContributors: analytics.topUploaders,
      engagementMetrics: {
        avgLoginsPerMonth: 18.5,
        avgUploadsPerTeacher: 12.3,
        avgDownloadsPerTeacher: 67.2,
        mostActiveDay: 'Wednesday',
        peakActivityHour: '10:00 AM'
      },
      inactiveUsers: [
        { name: 'Peter Kamau', lastLogin: '2024-01-05', status: 'Inactive for 10+ days' },
        { name: 'Grace Njeri', lastLogin: '2024-01-08', status: 'Inactive for 7+ days' }
      ]
    };

    const csvContent = generateActivityReportCSV(activityData);
    downloadCSV(csvContent, 'teacher-activity-report.csv');

    toast.success('Report Generated', {
      description: 'Teacher activity report has been downloaded successfully'
    });
  };

  const handleExportReport = () => {
    // Generate comprehensive report based on current time range and analytics
    const reportData = {
      reportType: 'Comprehensive Analytics Report',
      timeRange: timeRange,
      generatedDate: new Date().toISOString(),
      summary: {
        totalUsers: analytics.totalUsers,
        activeUsers: analytics.activeUsers,
        totalDocuments: analytics.totalDocuments,
        totalDownloads: analytics.totalDownloads,
        storageUsed: analytics.storageUsed
      },
      categories: analytics.popularCategories,
      uploads: analytics.monthlyUploads,
      topUsers: analytics.topUploaders
    };

    const csvContent = generateComprehensiveReportCSV(reportData);
    downloadCSV(csvContent, `analytics-report-${timeRange}days.csv`);

    toast.success('Report Generated', {
      description: `Analytics report for the last ${timeRange} days has been downloaded successfully`
    });
  };

  const handleStorageReport = () => {
    // Generate storage usage and capacity planning report
    const storageData = {
      reportType: 'Storage Usage & Capacity Report',
      generatedDate: new Date().toISOString(),
      currentUsage: `${analytics.storageUsed} GB`,
      totalCapacity: '10 GB',
      usagePercentage: Math.round((analytics.storageUsed / 10) * 100),
      projectedUsage: {
        nextMonth: '2.8 GB',
        next3Months: '3.5 GB',
        next6Months: '4.2 GB'
      },
      storageByCategory: [
        { category: 'Lesson Plans', usage: '0.8 GB', percentage: 33 },
        { category: 'Assessment Reports', usage: '0.6 GB', percentage: 25 },
        { category: 'Student Records', usage: '0.5 GB', percentage: 21 },
        { category: 'Administrative Forms', usage: '0.3 GB', percentage: 13 },
        { category: 'Others', usage: '0.2 GB', percentage: 8 }
      ],
      recommendations: [
        'Consider upgrading storage plan within 6 months',
        'Implement file compression for older documents',
        'Archive documents older than 2 years to cold storage'
      ]
    };

    const csvContent = generateStorageReportCSV(storageData);
    downloadCSV(csvContent, 'storage-capacity-report.csv');

    toast.success('Report Generated', {
      description: 'Storage capacity report has been downloaded successfully'
    });
  };

  // Mock analytics data
  const analytics = {
    totalUsers: 45,
    activeUsers: 38,
    totalDocuments: 156,
    totalDownloads: 1247,
    storageUsed: 2.4, // GB
    popularCategories: [
      { name: 'Lesson Plans', count: 45, percentage: 29 },
      { name: 'Assessment Reports', count: 32, percentage: 21 },
      { name: 'Student Records', count: 28, percentage: 18 },
      { name: 'Administrative Forms', count: 25, percentage: 16 },
      { name: 'Others', count: 26, percentage: 16 }
    ],
    monthlyUploads: [
      { month: 'Oct', uploads: 23 },
      { month: 'Nov', uploads: 34 },
      { month: 'Dec', uploads: 45 },
      { month: 'Jan', uploads: 54 }
    ],
    topUploaders: [
      { name: 'Jane Mwangi', uploads: 24, downloads: 156 },
      { name: 'John Kiprotich', uploads: 18, downloads: 134 },
      { name: 'Mary Ochieng', uploads: 15, downloads: 89 },
      { name: 'David Mwema', uploads: 12, downloads: 76 },
      { name: 'Sarah Wanjiku', uploads: 8, downloads: 45 }
    ]
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground">
              System insights and usage analytics
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{analytics.totalUsers}</p>
                  <p className="text-xs text-success">+12% from last month</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Documents</p>
                  <p className="text-2xl font-bold">{analytics.totalDocuments}</p>
                  <p className="text-xs text-success">+23% from last month</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Downloads</p>
                  <p className="text-2xl font-bold">{analytics.totalDownloads}</p>
                  <p className="text-xs text-success">+8% from last month</p>
                </div>
                <Download className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Storage Used</p>
                  <p className="text-2xl font-bold">{analytics.storageUsed} GB</p>
                  <p className="text-xs text-muted-foreground">of 10 GB total</p>
                </div>
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Popular Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Popular Categories
              </CardTitle>
              <CardDescription>
                Document categories by usage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analytics.popularCategories.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{category.name}</span>
                    <span>{category.count} documents</span>
                  </div>
                  <Progress value={category.percentage} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Top Uploaders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Contributors
              </CardTitle>
              <CardDescription>
                Most active teachers this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topUploaders.map((uploader, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{uploader.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {uploader.uploads} uploads • {uploader.downloads} downloads
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{uploader.uploads}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Upload Activity
            </CardTitle>
            <CardDescription>
              Monthly upload trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-64 border-b border-muted">
              {analytics.monthlyUploads.map((month, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div 
                    className="w-16 bg-primary rounded-t"
                    style={{ height: `${(month.uploads / 60) * 200}px` }}
                  />
                  <span className="text-sm text-muted-foreground">{month.month}</span>
                  <span className="text-xs font-medium">{month.uploads}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleDocumentReport}>
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Document Report</h3>
              <p className="text-sm text-muted-foreground">
                Detailed document usage analysis
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleUserActivityReport}>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">User Activity Report</h3>
              <p className="text-sm text-muted-foreground">
                Teacher engagement and usage patterns
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleStorageReport}>
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Storage Report</h3>
              <p className="text-sm text-muted-foreground">
                Storage usage and capacity planning
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
