import Link from 'next/link';
import { ArrowRight, Check, Clock, AlertCircle } from '@/components/icons';

const roadmapItems = [
  {
    title: 'Core CLI Foundation',
    description: 'Basic vault management, encryption, and secret operations',
    status: 'completed',
    version: 'v1.0.0',
    items: [
      'Vault initialization and management',
      'AES-256 encryption with PBKDF2',
      'Add, get, list, and remove secrets',
      'Basic CLI interface with help system',
    ],
  },
  {
    title: 'Team Collaboration',
    description: 'Multi-user support and team management features',
    status: 'completed',
    version: 'v1.1.0',
    items: [
      'Team member management',
      'Role-based access control',
      'Shared vault permissions',
      'Team invitation system',
    ],
  },
  {
    title: 'Cloud Synchronization',
    description: 'Cross-device vault synchronization with cloud providers',
    status: 'completed',
    version: 'v1.2.0',
    items: [
      'AWS S3 integration',
      'Azure Blob Storage support',
      'GitHub Gist provider',
      'Automatic sync and conflict resolution',
    ],
  },
  {
    title: 'Enhanced Security',
    description: 'Advanced security features and audit capabilities',
    status: 'in-progress',
    version: 'v1.3.0',
    items: [
      'Hardware security key support',
      'Audit logging and activity tracking',
      'Advanced encryption options',
      'Security policy enforcement',
    ],
  },
  {
    title: 'Web Dashboard',
    description: 'Browser-based interface for vault management',
    status: 'planned',
    version: 'v2.0.0',
    items: [
      'Modern web interface',
      'Visual vault browser',
      'Team management dashboard',
      'Usage analytics and reporting',
    ],
  },
  {
    title: 'Enterprise Features',
    description: 'Advanced features for large organizations',
    status: 'planned',
    version: 'v2.1.0',
    items: [
      'LDAP/SAML integration',
      'Advanced compliance reporting',
      'Custom encryption backends',
      'Enterprise support and SLA',
    ],
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <Check className="h-5 w-5 text-green-500" />;
    case 'in-progress':
      return <Clock className="h-5 w-5 text-yellow-500" />;
    case 'planned':
      return <AlertCircle className="h-5 w-5 text-blue-500" />;
    default:
      return <AlertCircle className="h-5 w-5 text-gray-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'border-green-500/50 bg-green-500/10';
    case 'in-progress':
      return 'border-yellow-500/50 bg-yellow-500/10';
    case 'planned':
      return 'border-blue-500/50 bg-blue-500/10';
    default:
      return 'border-gray-500/50 bg-gray-500/10';
  }
};

export default function RoadmapPage() {
  return (
    <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
          SafeKey <span className="gradient-text">Roadmap</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Our vision for the future of secure secret management. Track our
          progress and see what's coming next.
        </p>
        <Link
          href="/docs/getting-started"
          className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground px-6 py-3 text-sm font-medium transition-all hover:bg-primary/90"
        >
          Get Started Today
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>

      {/* Progress overview */}
      <div className="glass rounded-2xl p-8 mb-16">
        <h2 className="text-2xl font-bold mb-6">Development Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-500 mb-2">3</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-500 mb-2">1</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-500 mb-2">2</div>
            <div className="text-sm text-muted-foreground">Planned</div>
          </div>
        </div>
      </div>

      {/* Roadmap items */}
      <div className="space-y-8">
        {roadmapItems.map((item, index) => (
          <div
            key={index}
            className={`glass rounded-2xl p-8 border-2 ${getStatusColor(item.status)}`}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                {getStatusIcon(item.status)}
                <div>
                  <h3 className="text-2xl font-bold text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                  {item.version}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                    item.status === 'completed'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : item.status === 'in-progress'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}
                >
                  {item.status.replace('-', ' ')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {item.items.map((feature, featureIndex) => (
                <div key={featureIndex} className="flex items-start space-x-3">
                  <div className="mt-1">
                    {item.status === 'completed' ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center mt-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">Have suggestions?</h2>
          <p className="text-muted-foreground mb-6">
            We'd love to hear your ideas for improving SafeKey. Join the
            discussion on GitHub.
          </p>
          <Link
            href="https://github.com/Vasudevshetty/safekey/discussions"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-background/80 backdrop-blur-sm px-6 py-3 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground"
          >
            Join Discussion
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
