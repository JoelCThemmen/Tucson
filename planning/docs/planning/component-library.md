# Component Library Specification
## Investor Relationship Management Platform

### Version 1.0
### Date: September 2025

---

## 1. Foundation Components

### 1.1 Buttons

```tsx
// Button Component Specification
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'gold';
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  state: 'default' | 'hover' | 'active' | 'disabled' | 'loading';
  icon?: IconType;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  elevation?: boolean;
  ripple?: boolean;
  haptic?: boolean;
  tooltip?: string;
}

// Primary Button
<Button variant="primary" size="lg">
  Invest Now
</Button>

// Gold CTA Button (Premium Action)
<Button 
  variant="gold" 
  size="xl" 
  icon={DiamondIcon}
  elevation
  ripple
>
  Exclusive Access
</Button>

// Loading State
<Button variant="primary" state="loading">
  <Spinner size="sm" />
  Processing...
</Button>

// CSS Implementation
.btn {
  --btn-height: var(--size-md);
  --btn-padding: var(--space-4) var(--space-6);
  --btn-font-size: var(--text-base);
  
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: var(--btn-height);
  padding: var(--btn-padding);
  font-size: var(--btn-font-size);
  font-weight: 600;
  line-height: 1;
  border-radius: 12px;
  transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  cursor: pointer;
  overflow: hidden;
  
  &.btn-primary {
    background: linear-gradient(135deg, #3B4371, #283058);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.1);
    
    &:hover {
      background: linear-gradient(135deg, #5A6399, #3B4371);
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(59, 67, 113, 0.3);
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: 0 5px 10px rgba(59, 67, 113, 0.2);
    }
  }
  
  &.btn-gold {
    background: linear-gradient(135deg, #DAA520, #B8860B);
    color: #0A0E27;
    font-weight: 700;
    box-shadow: 0 4px 15px rgba(218, 165, 32, 0.3);
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      transition: left 0.5s;
    }
    
    &:hover::before {
      left: 100%;
    }
  }
  
  // Ripple Effect
  .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    transform: scale(0);
    animation: ripple 0.6s ease-out;
  }
  
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
}
```

### 1.2 Cards

```tsx
// Card Component Variants
interface CardProps {
  variant: 'default' | 'glass' | 'gradient' | 'neumorphic' | 'interactive';
  elevation: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  padding: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  aiHighlight?: boolean;
}

// Investment Card Component
const InvestmentCard: React.FC<InvestmentCardProps> = ({
  opportunity,
  onInvest,
  showSocialSignals
}) => (
  <div className="investment-card">
    {opportunity.trending && (
      <div className="trending-badge">
        <TrendingIcon className="animate-pulse" />
        Trending
      </div>
    )}
    
    <div className="card-header">
      <img src={opportunity.logo} alt={opportunity.name} />
      <div className="header-info">
        <h3>{opportunity.name}</h3>
        <p>{opportunity.sector}</p>
      </div>
      {opportunity.aiRecommended && (
        <AIBadge score={opportunity.aiScore} />
      )}
    </div>
    
    <div className="card-metrics">
      <Metric label="Min Investment" value={opportunity.minimum} />
      <Metric label="Target Raise" value={opportunity.target} />
      <Metric label="Investors" value={opportunity.investorCount} />
    </div>
    
    <ProgressBar 
      value={opportunity.raised} 
      max={opportunity.target}
      showPercentage
      animated
    />
    
    {showSocialSignals && (
      <SocialSignals 
        views={opportunity.views}
        interests={opportunity.interests}
        topInvestors={opportunity.topInvestors}
      />
    )}
    
    <div className="card-actions">
      <Button variant="ghost" size="sm">
        Learn More
      </Button>
      <Button variant="gold" size="sm" onClick={onInvest}>
        Invest
      </Button>
    </div>
  </div>
);

// Glass Card Style
.card-glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 24px;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 20px;
    padding: 1px;
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.1),
      rgba(255, 255, 255, 0.05)
    );
    mask: linear-gradient(#fff 0 0) content-box, 
          linear-gradient(#fff 0 0);
    mask-composite: exclude;
  }
}
```

### 1.3 Forms

```tsx
// Form Field Component
interface FormFieldProps {
  type: 'text' | 'number' | 'email' | 'password' | 'select' | 'textarea';
  label: string;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  helper?: string;
  required?: boolean;
  aiAssist?: boolean;
  validation?: ValidationRule[];
}

const IntelligentFormField: React.FC<FormFieldProps> = ({
  type,
  label,
  value,
  onChange,
  error,
  helper,
  required,
  aiAssist
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className={`form-field ${isFocused ? 'focused' : ''} ${error ? 'error' : ''}`}>
      <label className="field-label">
        {label}
        {required && <span className="required">*</span>}
        {aiAssist && (
          <button className="ai-assist-btn" onClick={handleAIAssist}>
            <AIIcon /> AI Help
          </button>
        )}
      </label>
      
      <div className="field-wrapper">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="field-input"
        />
        
        {aiAssist && suggestions.length > 0 && (
          <div className="ai-suggestions">
            {suggestions.map((suggestion, i) => (
              <button
                key={i}
                className="suggestion"
                onClick={() => onChange(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {error && (
        <div className="field-error">
          <ErrorIcon /> {error}
        </div>
      )}
      
      {helper && !error && (
        <div className="field-helper">
          <InfoIcon /> {helper}
        </div>
      )}
    </div>
  );
};

// Investment Amount Input
const InvestmentAmountInput: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [projectedReturns, setProjectedReturns] = useState(null);
  
  const quickAmounts = [10000, 25000, 50000, 100000, 250000];
  
  return (
    <div className="investment-amount-input">
      <label>Investment Amount</label>
      
      <div className="amount-input-wrapper">
        <span className="currency-symbol">$</span>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={amount}
          onChange={(e) => setAmount(formatCurrency(e.target.value))}
          placeholder="0"
          className="amount-input"
        />
      </div>
      
      <div className="quick-amounts">
        {quickAmounts.map(value => (
          <button
            key={value}
            className="quick-amount-btn"
            onClick={() => setAmount(formatCurrency(value))}
          >
            ${formatNumber(value)}
          </button>
        ))}
      </div>
      
      {projectedReturns && (
        <div className="projected-returns">
          <h4>Projected Returns</h4>
          <div className="returns-grid">
            <div className="return-scenario">
              <span className="scenario-label">Conservative</span>
              <span className="scenario-value">
                ${formatNumber(projectedReturns.conservative)}
              </span>
            </div>
            <div className="return-scenario">
              <span className="scenario-label">Expected</span>
              <span className="scenario-value">
                ${formatNumber(projectedReturns.expected)}
              </span>
            </div>
            <div className="return-scenario">
              <span className="scenario-label">Optimistic</span>
              <span className="scenario-value">
                ${formatNumber(projectedReturns.optimistic)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

### 1.4 Navigation

```tsx
// Advanced Navigation Component
const NavigationBar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, notifications, aiInsights } = useAppContext();
  
  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <div className="nav-start">
          <Logo variant="symbol" />
          <NavigationMenu items={mainNavItems} />
        </div>
        
        <div className="nav-center">
          <GlobalSearch 
            isOpen={searchOpen}
            onToggle={() => setSearchOpen(!searchOpen)}
          />
        </div>
        
        <div className="nav-end">
          <AIAssistantButton insights={aiInsights} />
          
          <NotificationCenter 
            notifications={notifications}
            unreadCount={notifications.filter(n => !n.read).length}
          />
          
          <UserMenu user={user} />
        </div>
      </div>
      
      <QuickActionsBar />
    </nav>
  );
};

// Mobile Navigation
const MobileNavigation: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  
  const tabs = [
    { id: 'home', icon: HomeIcon, label: 'Home' },
    { id: 'portfolio', icon: PortfolioIcon, label: 'Portfolio' },
    { id: 'invest', icon: InvestIcon, label: 'Invest', special: true },
    { id: 'events', icon: EventsIcon, label: 'Events' },
    { id: 'profile', icon: ProfileIcon, label: 'Profile' }
  ];
  
  return (
    <div className="mobile-nav">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`nav-tab ${activeTab === tab.id ? 'active' : ''} ${tab.special ? 'special' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          <tab.icon className="tab-icon" />
          <span className="tab-label">{tab.label}</span>
          {tab.special && <span className="tab-badge">New</span>}
        </button>
      ))}
    </div>
  );
};
```

---

## 2. Data Visualization Components

### 2.1 Charts

```tsx
// Portfolio Performance Chart
interface PortfolioChartProps {
  data: TimeSeriesData[];
  showPrediction?: boolean;
  showBenchmark?: boolean;
  interactive?: boolean;
}

const PortfolioPerformanceChart: React.FC<PortfolioChartProps> = ({
  data,
  showPrediction,
  showBenchmark,
  interactive
}) => {
  return (
    <div className="portfolio-chart">
      <div className="chart-header">
        <h3>Portfolio Performance</h3>
        <div className="chart-controls">
          <TimeRangeSelector />
          <ChartTypeToggle />
          <FullscreenToggle />
        </div>
      </div>
      
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#DAA520" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#DAA520" stopOpacity={0}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip content={<CustomTooltip />} />
            
            <Area
              type="monotone"
              dataKey="value"
              stroke="#DAA520"
              strokeWidth={2}
              fill="url(#portfolioGradient)"
            />
            
            {showPrediction && (
              <Area
                type="monotone"
                dataKey="predicted"
                stroke="#10B981"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="none"
              />
            )}
            
            {showBenchmark && (
              <Line
                type="monotone"
                dataKey="benchmark"
                stroke="#6B7280"
                strokeWidth={1}
                dot={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {interactive && (
        <ChartInteractionPanel 
          onScenarioChange={handleScenarioChange}
          onExport={handleExport}
        />
      )}
    </div>
  );
};

// Asset Allocation Donut Chart
const AssetAllocationChart: React.FC = ({ allocations }) => {
  const chartData = allocations.map(a => ({
    name: a.category,
    value: a.percentage,
    amount: a.amount,
    color: a.color
  }));
  
  return (
    <div className="allocation-chart">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<AllocationTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      
      <div className="chart-center-label">
        <div className="total-value">${formatNumber(totalValue)}</div>
        <div className="total-label">Total Portfolio</div>
      </div>
      
      <div className="allocation-legend">
        {chartData.map(item => (
          <div key={item.name} className="legend-item">
            <span className="legend-color" style={{ background: item.color }} />
            <span className="legend-label">{item.name}</span>
            <span className="legend-value">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 2.2 Metrics & KPIs

```tsx
// KPI Card Component
interface KPICardProps {
  label: string;
  value: number | string;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  sparkline?: number[];
  icon?: React.ComponentType;
  aiInsight?: string;
}

const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  change,
  changeType,
  sparkline,
  icon: Icon,
  aiInsight
}) => {
  return (
    <div className="kpi-card">
      <div className="kpi-header">
        {Icon && <Icon className="kpi-icon" />}
        <span className="kpi-label">{label}</span>
        {aiInsight && (
          <Tooltip content={aiInsight}>
            <AIIcon className="kpi-ai-icon" />
          </Tooltip>
        )}
      </div>
      
      <div className="kpi-value">
        <AnimatedNumber value={value} format={formatCurrency} />
      </div>
      
      {change !== undefined && (
        <div className={`kpi-change ${changeType}`}>
          <ChangeIcon direction={change >= 0 ? 'up' : 'down'} />
          <span>{Math.abs(change)}%</span>
          <span className="change-period">vs last month</span>
        </div>
      )}
      
      {sparkline && (
        <div className="kpi-sparkline">
          <Sparkline data={sparkline} color={getSparklineColor(changeType)} />
        </div>
      )}
    </div>
  );
};

// Metric Grid
const MetricsGrid: React.FC = ({ metrics }) => {
  return (
    <div className="metrics-grid">
      {metrics.map(metric => (
        <KPICard key={metric.id} {...metric} />
      ))}
    </div>
  );
};
```

### 2.3 Tables

```tsx
// Advanced Data Table
interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  sortable?: boolean;
  filterable?: boolean;
  selectable?: boolean;
  pagination?: boolean;
  exportable?: boolean;
  aiAnalysis?: boolean;
}

const InvestmentTable: React.FC = () => {
  const columns = [
    {
      header: 'Investment',
      accessor: 'name',
      cell: ({ row }) => (
        <div className="investment-cell">
          <img src={row.logo} alt={row.name} className="investment-logo" />
          <div>
            <div className="investment-name">{row.name}</div>
            <div className="investment-sector">{row.sector}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Amount',
      accessor: 'amount',
      cell: ({ value }) => formatCurrency(value),
      sortable: true
    },
    {
      header: 'Current Value',
      accessor: 'currentValue',
      cell: ({ value, row }) => (
        <div className="value-cell">
          <span>{formatCurrency(value)}</span>
          <ChangeIndicator 
            value={row.valueChange} 
            percentage={row.valueChangePercent}
          />
        </div>
      ),
      sortable: true
    },
    {
      header: 'Returns',
      accessor: 'returns',
      cell: ({ value }) => (
        <div className={`returns-cell ${value >= 0 ? 'positive' : 'negative'}`}>
          {value >= 0 ? '+' : ''}{value}%
        </div>
      ),
      sortable: true
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: ({ row }) => (
        <div className="actions-cell">
          <IconButton icon={ViewIcon} onClick={() => handleView(row)} />
          <IconButton icon={TradeIcon} onClick={() => handleTrade(row)} />
          <IconButton icon={MoreIcon} onClick={() => handleMore(row)} />
        </div>
      )
    }
  ];
  
  return (
    <DataTable
      columns={columns}
      data={investments}
      sortable
      filterable
      pagination
      exportable
      aiAnalysis
    />
  );
};

// Table Styles
.data-table {
  background: var(--dark-surface-2);
  border-radius: 16px;
  overflow: hidden;
  
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    
    .table-title {
      font-size: 18px;
      font-weight: 600;
    }
    
    .table-actions {
      display: flex;
      gap: 12px;
    }
  }
  
  table {
    width: 100%;
    
    thead {
      background: rgba(255, 255, 255, 0.02);
      
      th {
        padding: 12px 24px;
        text-align: left;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--gray-400);
        
        &.sortable {
          cursor: pointer;
          user-select: none;
          
          &:hover {
            color: var(--gray-300);
          }
        }
      }
    }
    
    tbody {
      tr {
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        transition: background 0.2s;
        
        &:hover {
          background: rgba(255, 255, 255, 0.02);
        }
        
        &.selected {
          background: rgba(59, 67, 113, 0.2);
        }
      }
      
      td {
        padding: 16px 24px;
        font-size: 14px;
      }
    }
  }
}
```

---

## 3. Advanced Components

### 3.1 AI Assistant

```tsx
// AI Assistant Component
const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  return (
    <div className={`ai-assistant ${isOpen ? 'open' : ''}`}>
      <button className="ai-trigger" onClick={() => setIsOpen(!isOpen)}>
        <div className="ai-avatar">
          <AIAvatar animated />
        </div>
        {hasNewInsights && <span className="insight-badge" />}
      </button>
      
      {isOpen && (
        <div className="ai-panel">
          <div className="ai-header">
            <div className="ai-info">
              <h3>Victoria</h3>
              <span className="ai-status">AI Investment Concierge</span>
            </div>
            <button className="ai-close" onClick={() => setIsOpen(false)}>
              <CloseIcon />
            </button>
          </div>
          
          <div className="ai-messages">
            {messages.map(message => (
              <AIMessage key={message.id} {...message} />
            ))}
            {isTyping && <TypingIndicator />}
          </div>
          
          <div className="ai-suggestions">
            <button className="suggestion">
              "Show me trending opportunities"
            </button>
            <button className="suggestion">
              "Analyze my portfolio risk"
            </button>
            <button className="suggestion">
              "Find tax optimization strategies"
            </button>
          </div>
          
          <div className="ai-input">
            <input
              type="text"
              placeholder="Ask me anything..."
              onKeyPress={handleSendMessage}
            />
            <button className="ai-voice">
              <MicIcon />
            </button>
            <button className="ai-send">
              <SendIcon />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
```

### 3.2 Virtual Networking Room

```tsx
// Virtual Networking Room Component
const VirtualNetworkingRoom: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(false);
  
  return (
    <div className="networking-room">
      <div className="room-header">
        <h2>Executive Lounge</h2>
        <div className="room-info">
          <span className="participant-count">
            <UsersIcon /> {participants.length} investors
          </span>
          <span className="room-topic">Topic: Series B Opportunities</span>
        </div>
      </div>
      
      <div className="room-layout">
        <div className="main-stage">
          <div className="speaker-spotlight">
            {currentSpeaker && (
              <ParticipantCard 
                participant={currentSpeaker}
                isSpeaking
                large
              />
            )}
          </div>
        </div>
        
        <div className="networking-tables">
          {tables.map(table => (
            <NetworkingTable
              key={table.id}
              table={table}
              onJoin={handleJoinTable}
            />
          ))}
        </div>
        
        <div className="participant-grid">
          {participants.map(participant => (
            <ParticipantAvatar
              key={participant.id}
              participant={participant}
              onClick={() => handleParticipantClick(participant)}
            />
          ))}
        </div>
      </div>
      
      <div className="room-controls">
        <button 
          className={`control-btn ${audioEnabled ? 'active' : ''}`}
          onClick={() => setAudioEnabled(!audioEnabled)}
        >
          {audioEnabled ? <MicIcon /> : <MicOffIcon />}
        </button>
        <button 
          className={`control-btn ${videoEnabled ? 'active' : ''}`}
          onClick={() => setVideoEnabled(!videoEnabled)}
        >
          {videoEnabled ? <VideoIcon /> : <VideoOffIcon />}
        </button>
        <button className="control-btn">
          <ShareIcon />
        </button>
        <button className="control-btn danger">
          <LeaveIcon /> Leave
        </button>
      </div>
    </div>
  );
};
```

### 3.3 Interactive Deal Room

```tsx
// Deal Room Component
const InteractiveDealRoom: React.FC = () => {
  const [view, setView] = useState<'overview' | 'documents' | 'analytics' | 'discussion'>('overview');
  const [is3DMode, setIs3DMode] = useState(false);
  
  return (
    <div className="deal-room">
      <DealRoomHeader 
        opportunity={opportunity}
        onToggle3D={() => setIs3DMode(!is3DMode)}
      />
      
      {is3DMode ? (
        <DealRoom3D opportunity={opportunity} />
      ) : (
        <>
          <div className="deal-nav">
            <TabNav
              tabs={['overview', 'documents', 'analytics', 'discussion']}
              activeTab={view}
              onTabChange={setView}
            />
          </div>
          
          <div className="deal-content">
            {view === 'overview' && (
              <DealOverview 
                opportunity={opportunity}
                onWatchPresentation={handleWatchPresentation}
              />
            )}
            
            {view === 'documents' && (
              <DocumentHub
                documents={documents}
                onDocumentClick={handleDocumentClick}
                aiReview={true}
              />
            )}
            
            {view === 'analytics' && (
              <DealAnalytics
                metrics={metrics}
                scenarios={scenarios}
                comparisons={comparisons}
              />
            )}
            
            {view === 'discussion' && (
              <InvestorDiscussion
                comments={comments}
                onComment={handleComment}
                anonymousMode={anonymousMode}
              />
            )}
          </div>
        </>
      )}
      
      <DealRoomSidebar
        socialSignals={socialSignals}
        expertOpinions={expertOpinions}
        onInvest={handleInvest}
      />
    </div>
  );
};
```

### 3.4 Achievement System

```tsx
// Achievement Badge Component
const AchievementBadge: React.FC<{ achievement: Achievement }> = ({ achievement }) => {
  const [isUnlocking, setIsUnlocking] = useState(false);
  
  return (
    <div className={`achievement-badge ${achievement.unlocked ? 'unlocked' : 'locked'} ${isUnlocking ? 'unlocking' : ''}`}>
      <div className="badge-icon">
        {achievement.icon}
      </div>
      <div className="badge-info">
        <h4>{achievement.name}</h4>
        <p>{achievement.description}</p>
        {achievement.unlocked && (
          <span className="unlock-date">
            Unlocked {formatDate(achievement.unlockedAt)}
          </span>
        )}
      </div>
      {achievement.progress && (
        <div className="badge-progress">
          <ProgressBar 
            value={achievement.progress.current}
            max={achievement.progress.target}
            showLabel
          />
        </div>
      )}
    </div>
  );
};

// Achievement Notification
const AchievementNotification: React.FC = ({ achievement }) => {
  return (
    <div className="achievement-notification">
      <div className="achievement-glow" />
      <div className="achievement-content">
        <div className="achievement-icon-large">
          {achievement.icon}
        </div>
        <h3>Achievement Unlocked!</h3>
        <h4>{achievement.name}</h4>
        <p>{achievement.description}</p>
        <div className="achievement-rewards">
          <span className="points">+{achievement.points} points</span>
          {achievement.perks && (
            <span className="perks">{achievement.perks.join(', ')}</span>
          )}
        </div>
      </div>
      <Confetti />
    </div>
  );
};
```

---

## 4. Layout Components

### 4.1 Dashboard Layout

```tsx
// Dashboard Layout Component
const DashboardLayout: React.FC = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  
  return (
    <div className={`dashboard-layout ${darkMode ? 'dark' : 'light'}`}>
      <NavigationBar />
      
      <div className="dashboard-container">
        <Sidebar 
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        <main className="dashboard-main">
          <div className="dashboard-header">
            <Breadcrumbs />
            <QuickActions />
          </div>
          
          <div className="dashboard-content">
            {children}
          </div>
        </main>
        
        <RightPanel>
          <AIInsights />
          <UpcomingEvents />
          <MarketPulse />
        </RightPanel>
      </div>
      
      <MobileNavigation />
    </div>
  );
};
```

### 4.2 Grid System

```tsx
// Responsive Grid Component
const Grid: React.FC<GridProps> = ({ 
  columns = 12, 
  gap = 'md', 
  responsive = true,
  children 
}) => {
  return (
    <div 
      className={`grid grid-${columns} gap-${gap} ${responsive ? 'responsive' : ''}`}
      style={{
        '--columns': columns,
        '--gap': `var(--space-${gap})`
      }}
    >
      {children}
    </div>
  );
};

// Grid Item
const GridItem: React.FC<GridItemProps> = ({ 
  span = 1, 
  spanMd, 
  spanLg, 
  spanXl,
  children 
}) => {
  return (
    <div 
      className="grid-item"
      style={{
        '--span': span,
        '--span-md': spanMd || span,
        '--span-lg': spanLg || spanMd || span,
        '--span-xl': spanXl || spanLg || spanMd || span
      }}
    >
      {children}
    </div>
  );
};

// CSS Grid Implementation
.grid {
  display: grid;
  grid-template-columns: repeat(var(--columns), 1fr);
  gap: var(--gap);
  
  &.responsive {
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
    
    @media (min-width: 769px) and (max-width: 1024px) {
      grid-template-columns: repeat(6, 1fr);
    }
  }
}

.grid-item {
  grid-column: span var(--span);
  
  @media (min-width: 768px) {
    grid-column: span var(--span-md);
  }
  
  @media (min-width: 1024px) {
    grid-column: span var(--span-lg);
  }
  
  @media (min-width: 1280px) {
    grid-column: span var(--span-xl);
  }
}
```

---

## 5. Utility Components

### 5.1 Modals

```tsx
// Modal Component
const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  size = 'md',
  title,
  children,
  footer
}) => {
  if (!isOpen) return null;
  
  return (
    <Portal>
      <div className="modal-overlay" onClick={onClose}>
        <div 
          className={`modal modal-${size}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h2>{title}</h2>
            <button className="modal-close" onClick={onClose}>
              <CloseIcon />
            </button>
          </div>
          
          <div className="modal-body">
            {children}
          </div>
          
          {footer && (
            <div className="modal-footer">
              {footer}
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
};
```

### 5.2 Tooltips

```tsx
// Tooltip Component
const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  position = 'top',
  trigger = 'hover',
  children 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div className="tooltip-wrapper">
      <div
        className="tooltip-trigger"
        onMouseEnter={() => trigger === 'hover' && setIsVisible(true)}
        onMouseLeave={() => trigger === 'hover' && setIsVisible(false)}
        onClick={() => trigger === 'click' && setIsVisible(!isVisible)}
      >
        {children}
      </div>
      
      {isVisible && (
        <div className={`tooltip tooltip-${position}`}>
          <div className="tooltip-content">
            {content}
          </div>
          <div className="tooltip-arrow" />
        </div>
      )}
    </div>
  );
};
```

### 5.3 Loading States

```tsx
// Skeleton Loader
const SkeletonLoader: React.FC<{ type: 'text' | 'card' | 'chart' | 'table' }> = ({ type }) => {
  return (
    <div className={`skeleton skeleton-${type}`}>
      {type === 'card' && (
        <>
          <div className="skeleton-header" />
          <div className="skeleton-body">
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-line short" />
          </div>
        </>
      )}
      
      {type === 'table' && (
        <div className="skeleton-table">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton-row">
              <div className="skeleton-cell" />
              <div className="skeleton-cell" />
              <div className="skeleton-cell" />
              <div className="skeleton-cell" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Loading Spinner
const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => (
  <div className={`spinner spinner-${size}`}>
    <div className="spinner-ring" />
    <div className="spinner-ring" />
    <div className="spinner-ring" />
  </div>
);
```

---

## 6. Component Composition Examples

### 6.1 Investment Opportunity Page

```tsx
const InvestmentOpportunityPage: React.FC = () => {
  return (
    <DashboardLayout>
      <Grid columns={12} gap="lg">
        <GridItem span={8}>
          <InvestmentHero opportunity={opportunity} />
          <InvestmentTabs>
            <Tab label="Overview">
              <InvestmentOverview />
            </Tab>
            <Tab label="Financials">
              <FinancialAnalysis />
            </Tab>
            <Tab label="Team">
              <TeamSection />
            </Tab>
            <Tab label="Documents">
              <DocumentHub />
            </Tab>
          </InvestmentTabs>
        </GridItem>
        
        <GridItem span={4}>
          <InvestmentCard sticky>
            <InvestmentAmountInput />
            <ProjectedReturns />
            <InvestButton />
          </InvestmentCard>
          
          <SocialSignals />
          <InvestorActivity />
          <RelatedOpportunities />
        </GridItem>
      </Grid>
    </DashboardLayout>
  );
};
```

### 6.2 Portfolio Dashboard

```tsx
const PortfolioDashboard: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="portfolio-summary">
        <Grid columns={4} gap="md">
          <KPICard label="Total Value" value={totalValue} change={5.2} />
          <KPICard label="Total Invested" value={totalInvested} />
          <KPICard label="Total Returns" value={totalReturns} change={12.8} />
          <KPICard label="IRR" value="18.5%" change={2.1} />
        </Grid>
      </div>
      
      <Grid columns={12} gap="lg">
        <GridItem span={8}>
          <PortfolioPerformanceChart />
          <InvestmentTable />
        </GridItem>
        
        <GridItem span={4}>
          <AssetAllocationChart />
          <UpcomingDistributions />
          <AIRecommendations />
        </GridItem>
      </Grid>
    </DashboardLayout>
  );
};
```

---

## 7. Component States

### 7.1 Interactive States

```scss
// Button States
.btn {
  // Default
  &:not(:disabled) {
    cursor: pointer;
  }
  
  // Hover
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
  
  // Active/Pressed
  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.15);
  }
  
  // Focus
  &:focus-visible {
    outline: 3px solid var(--accent-gold-500);
    outline-offset: 2px;
  }
  
  // Disabled
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  // Loading
  &.loading {
    position: relative;
    color: transparent;
    pointer-events: none;
    
    &::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      top: 50%;
      left: 50%;
      margin-left: -8px;
      margin-top: -8px;
      border: 2px solid #ffffff;
      border-radius: 50%;
      border-top-color: transparent;
      animation: spin 0.6s linear infinite;
    }
  }
}
```

---

## 8. Implementation Guidelines

### 8.1 Component Structure
```
components/
├── foundation/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.styles.ts
│   │   ├── Button.types.ts
│   │   ├── Button.test.tsx
│   │   └── index.ts
│   ├── Card/
│   ├── Form/
│   └── Typography/
├── data-display/
│   ├── Table/
│   ├── Chart/
│   └── Metric/
├── navigation/
│   ├── Navbar/
│   ├── Sidebar/
│   └── Breadcrumb/
├── feedback/
│   ├── Alert/
│   ├── Toast/
│   └── Modal/
└── specialized/
    ├── AIAssistant/
    ├── InvestmentCard/
    └── NetworkingRoom/
```

### 8.2 Testing Strategy
- Unit tests for all components
- Visual regression testing with Chromatic
- Accessibility testing with axe-core
- Performance testing for large data sets
- Cross-browser testing

### 8.3 Documentation
- Storybook for component playground
- Props documentation with TypeScript
- Usage examples
- Design tokens documentation
- Accessibility guidelines

---

## Appendices

### A. Design Tokens
```javascript
export const tokens = {
  colors: { /* ... */ },
  spacing: { /* ... */ },
  typography: { /* ... */ },
  shadows: { /* ... */ },
  animations: { /* ... */ }
};
```

### B. Component Checklist
- [ ] TypeScript types defined
- [ ] Props documented
- [ ] Accessibility compliant
- [ ] Responsive design
- [ ] Dark/light mode support
- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] Tests written
- [ ] Storybook story created