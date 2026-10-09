/**
 * Learn Page — Educational Content
 *
 * Short, accurate, beginner-friendly explanations of core AWS
 * cost concepts.  No fluff — just what a beginner needs to
 * understand before estimating costs.
 */

import {
  Globe,
  CreditCard,
  Clock,
  HardDrive,
  ArrowRightLeft,
  Calculator,
  AlertCircle,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

const topics = [
  {
    icon: <Globe size={20} />,
    title: 'What is an AWS Region?',
    color: '#3b82f6',
    content:
      'An AWS Region is a geographic area (like US East or Europe) where AWS runs its data centres. ' +
      'Each region has multiple isolated facilities called Availability Zones. Prices can differ between regions — ' +
      'US East (N. Virginia) is often the cheapest. Choose a region close to your users for lower latency.',
    link: 'https://aws.amazon.com/about-aws/global-infrastructure/regions_az/',
  },
  {
    icon: <CreditCard size={20} />,
    title: 'What is Pay-As-You-Go Pricing?',
    color: '#22c55e',
    content:
      'With pay-as-you-go, you only pay for the resources you actually use — no upfront commitments. ' +
      'If you run an EC2 instance for 10 hours, you pay for 10 hours. If you store 5 GB in S3, you pay for 5 GB. ' +
      'This makes AWS flexible, but it also means costs can grow if you forget to stop running resources.',
    link: 'https://aws.amazon.com/pricing/',
  },
  {
    icon: <Clock size={20} />,
    title: 'Why Do EC2 Running Hours Matter?',
    color: '#f59e0b',
    content:
      'EC2 instances are virtual servers billed per second (minimum 60 seconds). A month has ~730 hours. ' +
      'Running an instance 24/7 means paying for all 730 hours. If you only need it during working hours ' +
      '(~10 hrs/day, 22 days), that\'s ~220 hours — saving roughly 70% compared to running it non-stop. ' +
      'For dev/test workloads, always stop instances when you\'re done.',
    link: 'https://aws.amazon.com/ec2/pricing/',
  },
  {
    icon: <HardDrive size={20} />,
    title: 'Storage vs. Request Charges',
    color: '#8b5cf6',
    content:
      'Most storage services charge you twice: once for the amount of data stored (per GB/month) and ' +
      'once for how often you access it (per request). For example, S3 charges $0.023/GB/month for storage ' +
      'and $0.005 per 1,000 PUT requests. If you store a lot of data but rarely access it, consider ' +
      'cheaper storage classes like S3 Glacier.',
    link: 'https://aws.amazon.com/s3/pricing/',
  },
  {
    icon: <ArrowRightLeft size={20} />,
    title: 'Why Data Transfer Can Affect Cost',
    color: '#ec4899',
    content:
      'Data transfer IN to AWS is usually free. Data transfer OUT (to the internet or other regions) ' +
      'is charged per GB. This is often overlooked. If your application serves large files, images, or videos ' +
      'to users, data transfer can become a significant part of your bill. Using CloudFront (CDN) can reduce ' +
      'transfer costs by caching content at edge locations.',
    link: 'https://aws.amazon.com/ec2/pricing/on-demand/#Data_Transfer',
  },
  {
    icon: <AlertCircle size={20} />,
    title: 'Why Estimates May Differ from Actual Bills',
    color: '#ef4444',
    content:
      'Estimates are based on expected usage, but actual bills include: data transfer, CloudWatch monitoring, ' +
      'EBS storage, Elastic IPs, DNS queries, and other services you might not initially plan for. ' +
      'Free-tier benefits expire after 12 months (or have usage limits). Taxes and currency conversion also ' +
      'apply in some regions. Always set up AWS Budgets and billing alerts to catch unexpected costs early.',
    link: 'https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-managing-costs.html',
  },
  {
    icon: <Calculator size={20} />,
    title: 'Using the Official AWS Pricing Calculator',
    color: '#14b8a6',
    content:
      'AWS provides a free, official Pricing Calculator at calculator.aws. It has up-to-date prices for ' +
      'every service and region, and can model complex architectures. CloudCost Buddy is a simplified ' +
      'educational tool — for production planning, always cross-check with the official calculator.',
    link: 'https://calculator.aws/',
  },
];

export default function LearnPage() {
  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-violet/20 to-accent-blue/20 flex items-center justify-center">
          <BookOpen size={20} className="text-accent-violet-light" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-text-primary">AWS Cost Basics</h2>
          <p className="text-sm text-text-secondary">
            Key concepts every beginner should understand before estimating cloud costs.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {topics.map((topic, i) => (
          <div
            key={i}
            className="glass-card p-5 animate-slide-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${topic.color}20`, color: topic.color }}
              >
                {topic.icon}
              </div>
              <div>
                <h3 className="text-base font-semibold text-text-primary mb-2">{topic.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{topic.content}</p>
                <a
                  href={topic.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-accent-blue hover:underline mt-3"
                >
                  Learn more on AWS <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-5 rounded-xl bg-gradient-to-r from-accent-blue/10 to-accent-violet/10 border border-accent-blue/20 text-center">
        <p className="text-sm text-text-secondary mb-3">
          Ready to estimate your first AWS project?
        </p>
        <a
          href="https://calculator.aws/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-blue to-accent-violet text-white font-semibold hover:shadow-lg transition-all text-sm"
        >
          <Calculator size={16} />
          Open Official AWS Pricing Calculator
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}
