import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useReports } from '../hooks/useReports';
import Layout from '../components/Layout';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorBoundary';
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

// Helper functions for report generation
const generateDocumentReportCSV = (data: any) => {
  let csvContent = `Document Usage Analysis Report\n`;
  csvContent += `Generated: ${new Date(data.generatedDate).toLocaleString()}\n\n`;
  
  csvContent += `SUMMARY\n`;
  csvContent += `Total Documents,${data.totalDocuments}\n`;
  csvContent += `Total Storage,${data.storageBreakdown.totalStorage}\n`;
  csvContent += `Average File Size,${data.storageBreakdown.averageFileSize}\n\n`;
  
  csvContent += `DOCUMENTS BY CATEGORY\n`;
  csvContent += `Category,Document Count,Percentage\n`;
  data.documentsByCategory.forEach((cat: any) => {
    csvContent += `${cat.name},${cat.count},${cat.percentage}%\n`;
  });
  
  csvContent += `\nMONTHLY UPLOAD TRENDS\n`;
  csvContent += `Month,Uploads\n`;
  data.uploadTrends.forEach((month: any) => {
    csvContent += `${month.month},${month.uploads}\n`;
  });
  
  if (data.storageByFileType && data.storageByFileType.length > 0) {
    csvContent += `\nSTORAGE BY FILE TYPE\n`;
    csvContent += `File Type,Storage Used (GB),Percentage\n`;
    data.storageByFileType.forEach((item: any) => {
      csvContent += `${item.fileType},${item.usage},${item.percentage}%\n`;
    });
  }
  
  if (data.topDocuments && data.topDocuments.length > 0) {
    csvContent += `\nTOP DOWNLOADED DOCUMENTS\n`;
    csvContent += `Title,Downloads,Category,Uploaded By\n`;
    data.topDocuments.forEach((doc: any) => {
      csvContent += `"${doc.title}",${doc.downloadCount},${doc.category},${doc.teacher}\n`;
    });
  }
  
  return csvContent;
};

const generateActivityReportCSV = (data: any) => {
  let csvContent = `Teacher Engagement Report\n`;
  csvContent += `Generated: ${new Date(data.generatedDate).toLocaleString()}\n\n`;
  
  csvContent += `SUMMARY\n`;
  csvContent += `Total Teachers,${data.totalUsers}\n`;
  csvContent += `Active Teachers,${data.activeUsers}\n`;
  csvContent += `Teacher Activity Change,${data.engagementMetrics.usersChange}%\n`;
  csvContent += `Average Logins Per User,${data.engagementMetrics.avgLoginsPerUser?.toFixed(1) || 0}\n`;
  csvContent += `Average Uploads Per Teacher,${data.engagementMetrics.avgUploadsPerTeacher?.toFixed(1) || 0}\n`;
  csvContent += `Average Downloads Per Teacher,${data.engagementMetrics.avgDownloadsPerTeacher?.toFixed(1) || 0}\n`;
  
  // Add login frequency data if available
  if (data.loginFrequency && data.loginFrequency.length > 0) {
    csvContent += `\nLOGIN FREQUENCY PATTERNS\n`;
    csvContent += `Period,Login Count,Percentage\n`;
    data.loginFrequency.forEach((item: any) => {
      csvContent += `${item.period},${item.count},${item.percentage}%\n`;
    });
  }
  
  csvContent += `\nTOP CONTRIBUTORS\n`;
  csvContent += `Teacher Name,Uploads,Downloads\n`;
  data.topContributors.forEach((teacher: any) => {
    csvContent += `${teacher.name},${teacher.uploads},${teacher.downloads}\n`;
  });
  
  return csvContent;
};

const generateStorageReportCSV = (data: any) => {
  let csvContent = `Storage Usage & Capacity Report\n`;
  csvContent += `Generated: ${new Date(data.generatedDate).toLocaleString()}\n\n`;
  
  csvContent += `SUMMARY\n`;
  csvContent += `Current Storage Usage,${data.currentUsage}\n`;
  csvContent += `Total Storage Capacity,${data.totalCapacity}\n`;
  csvContent += `Usage Percentage,${data.usagePercentage}%\n\n`;
  
  csvContent += `PROJECTED USAGE\n`;
  csvContent += `Next Month,${data.projectedUsage.nextMonth}\n`;
  csvContent += `Next 3 Months,${data.projectedUsage.next3Months}\n`;
  csvContent += `Next 6 Months,${data.projectedUsage.next6Months}\n\n`;
  
  csvContent += `STORAGE BY CATEGORY/TYPE\n`;
  csvContent += `Category,Storage Used,Percentage\n`;
  data.storageByCategory.forEach((item: any) => {
    csvContent += `${item.category},${item.usage},${item.percentage}%\n`;
  });
  
  if (data.topDocuments && data.topDocuments.length > 0) {
    csvContent += `\nLARGEST DOCUMENTS BY DOWNLOADS\n`;
    csvContent += `Document,Downloads,Category,Uploaded By\n`;
    data.topDocuments.forEach((doc: any) => {
      csvContent += `"${doc.title}",${doc.downloadCount},${doc.category},${doc.teacher}\n`;
    });
  }
  
  csvContent += `\nRECOMMENDATIONS\n`;
  data.recommendations.forEach((rec: string) => {
    csvContent += `${rec}\n`;
  });
  
  return csvContent;
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

  csvContent += `\nMONTHLY UPLOADS\n`;
  csvContent += `Month,Uploads\n`;
  data.uploads.forEach((month: any) => {
    csvContent += `${month.month},${month.uploads}\n`;
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

export default function AdminReports() {
  const [timeRange, setTimeRange] = useState('30');
  const { data: reportsData, isLoading, error, fetchReports } = useReports();

  // Fetch reports data when component mounts or time range changes
  useEffect(() => {
    fetchReports(timeRange);
  }, [timeRange]); // Removed fetchReports from dependencies since it's stable

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    // fetchReports will be called automatically by useEffect
  };

  // Loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loading text="Loading reports data..." />
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout>
        <ErrorMessage message={error} />
      </Layout>
    );
  }

  // Use real data or fallback to empty data
  const analytics = reportsData || {
    totalUsers: 0,
    activeUsers: 0,
    totalDocuments: 0,
    totalDownloads: 0,
    storageUsed: 0,
    popularCategories: [],
    monthlyUploads: [],
    topUploaders: []
  };

  const handleDocumentReport = () => {
    // Use real data from the API for document report
    if (!reportsData) {
      toast.error('No report data available', {
        description: 'Please try again later or contact your administrator'
      });
      return;
    }

    // Generate and download detailed document usage report using actual data
    const reportData = {
      reportType: 'Document Usage Analysis',
      generatedDate: new Date().toISOString(),
      totalDocuments: analytics.totalDocuments,
      documentsByCategory: analytics.popularCategories,
      uploadTrends: analytics.monthlyUploads,
      storageBreakdown: {
        totalStorage: `${analytics.storageUsed} GB`,
        averageFileSize: ((analytics.storageUsed * 1024) / (analytics.totalDocuments || 1)).toFixed(2) + ' MB', // Calculate average
      },
      // Use the new detailed data
      storageByFileType: analytics.storageByFileType || [],
      topDocuments: analytics.topDocuments || []
    };

    // Create and download CSV report
    const csvContent = generateDocumentReportCSV(reportData);
    downloadCSV(csvContent, 'document-usage-report.csv');

    toast.success('Report Generated', {
      description: 'Document usage report has been downloaded successfully'
    });
  };

  const handleUserActivityReport = () => {
    // Use real data from the API for user activity report
    if (!reportsData) {
      toast.error('No report data available', {
        description: 'Please try again later or contact your administrator'
      });
      return;
    }

    // Generate teacher engagement and activity report with actual data
    const activityData = {
      reportType: 'Teacher Engagement Report',
      generatedDate: new Date().toISOString(),
      totalUsers: analytics.totalUsers,
      activeUsers: analytics.activeUsers,
      topContributors: analytics.topUploaders,
      engagementMetrics: {
        usersChange: analytics.usersChange || 0,
        avgLoginsPerUser: analytics.activityMetrics?.avgLoginsPerUser || 0,
        avgUploadsPerTeacher: analytics.activityMetrics?.avgUploadsPerTeacher || 0,
        avgDownloadsPerTeacher: analytics.activityMetrics?.avgDownloadsPerTeacher || 0
      },
      // Include login frequency patterns
      loginFrequency: analytics.loginFrequency || []
    };

    const csvContent = generateActivityReportCSV(activityData);
    downloadCSV(csvContent, 'teacher-activity-report.csv');

    toast.success('Report Generated', {
      description: 'Teacher activity report has been downloaded successfully'
    });
  };

  const handleExportReport = () => {
    // Use real data from the API for comprehensive report
    if (!reportsData) {
      toast.error('No report data available', {
        description: 'Please try again later or contact your administrator'
      });
      return;
    }

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
    // Use real data from the API for storage report
    if (!reportsData) {
      toast.error('No report data available', {
        description: 'Please try again later or contact your administrator'
      });
      return;
    }

    // Use the new storage by file type data if available
    const storageByCategory = analytics.storageByFileType ? 
      analytics.storageByFileType.map(item => ({
        category: item.fileType,
        usage: `${item.usage} GB`,
        percentage: item.percentage
      })) :
      // Fallback to category-based calculation if storage by file type is not available
      analytics.popularCategories.map(category => {
        // Calculate estimated storage used by this category
        const categoryStoragePercentage = category.percentage;
        const categoryStorageGB = (categoryStoragePercentage / 100 * analytics.storageUsed).toFixed(2);
        
        return {
          category: category.name,
          usage: `${categoryStorageGB} GB`,
          percentage: categoryStoragePercentage
        };
      });

    // Generate storage usage and capacity planning report
    const storageData = {
      reportType: 'Storage Usage & Capacity Report',
      generatedDate: new Date().toISOString(),
      currentUsage: `${analytics.storageUsed} GB`,
      totalCapacity: '10 GB', // This could come from system settings
      usagePercentage: Math.round((analytics.storageUsed / 10) * 100),
      projectedUsage: {
        // Simple projection based on current growth rate
        nextMonth: `${(analytics.storageUsed * (1 + (analytics.storageChange || 0) / 100)).toFixed(2)} GB`,
        next3Months: `${(analytics.storageUsed * (1 + (analytics.storageChange || 0) / 100 * 3)).toFixed(2)} GB`,
        next6Months: `${(analytics.storageUsed * (1 + (analytics.storageChange || 0) / 100 * 6)).toFixed(2)} GB`
      },
      storageByCategory: storageByCategory,
      topDocuments: analytics.topDocuments || [],
      recommendations: [
        analytics.storageUsed > 8 ? 'Urgent: Upgrade storage plan immediately' : 
        analytics.storageUsed > 5 ? 'Consider upgrading storage plan within 3 months' : 
        'Current storage capacity is sufficient',
        'Implement file compression for older documents',
        'Archive documents older than 1 year to save space'
      ]
    };

    const csvContent = generateStorageReportCSV(storageData);
    downloadCSV(csvContent, 'storage-capacity-report.csv');

    toast.success('Report Generated', {
      description: 'Storage capacity report has been downloaded successfully'
    });
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
              {isLoading && <span className="ml-2 text-blue-500">• Loading...</span>}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={handleTimeRangeChange} disabled={isLoading}>
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
            <Button onClick={handleExportReport} disabled={isLoading || !reportsData}>
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
                  <p className={`text-xs ${(analytics.usersChange || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {(analytics.usersChange || 0) >= 0 ? '+' : ''}{analytics.usersChange || 0}% from last period
                  </p>
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
                  <p className={`text-xs ${(analytics.documentsChange || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {(analytics.documentsChange || 0) >= 0 ? '+' : ''}{analytics.documentsChange || 0}% from last period
                  </p>
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
                  <p className={`text-xs ${(analytics.downloadsChange || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {(analytics.downloadsChange || 0) >= 0 ? '+' : ''}{analytics.downloadsChange || 0}% from last period
                  </p>
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
                  <p className={`text-xs ${(analytics.storageChange || 0) >= 0 ? 'text-muted-foreground' : 'text-success'}`}>
                    {(analytics.storageChange || 0) >= 0 ? '+' : ''}{analytics.storageChange || 0}% from last period
                  </p>
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

        {/* Storage By File Type */}
        {analytics.storageByFileType && analytics.storageByFileType.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Storage by File Type
              </CardTitle>
              <CardDescription>
                Storage usage breakdown by file format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analytics.storageByFileType.map((fileType, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: ['#4f46e5', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'][index % 5] }} 
                      />
                      <span>{fileType.fileType}</span>
                    </div>
                    <span>{fileType.usage} GB</span>
                  </div>
                  <Progress 
                    value={fileType.percentage} 
                    className="h-2"
                    style={{ 
                      backgroundColor: 'rgba(79, 70, 229, 0.1)',
                      '--progress-color': ['#4f46e5', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'][index % 5]
                    } as any}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

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

        {/* Top Downloaded Documents */}
        {analytics.topDocuments && analytics.topDocuments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Most Downloaded Documents
              </CardTitle>
              <CardDescription>
                Documents with highest download count
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topDocuments.slice(0, 5).map((document, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{document.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {document.category} • Uploaded by {document.teacher}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">{document.downloadCount} downloads</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleDocumentReport}>
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Document Report</h3>
              <p className="text-sm text-muted-foreground">
                Detailed document usage analysis
              </p>
              <Button variant="outline" size="sm" className="mt-4">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleUserActivityReport}>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">User Activity Report</h3>
              <p className="text-sm text-muted-foreground">
                Teacher engagement and usage patterns
              </p>
              <Button variant="outline" size="sm" className="mt-4">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleStorageReport}>
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Storage Report</h3>
              <p className="text-sm text-muted-foreground">
                Storage usage and capacity planning
              </p>
              <Button variant="outline" size="sm" className="mt-4">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
