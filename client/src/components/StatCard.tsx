interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: string;
}

export default function StatCard({ title, value, change, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-sm font-medium text-gray-500">{title}</h4>
        <span className="material-icons text-gray-400">{icon}</span>
      </div>
      <div className="flex items-baseline">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change !== 0 && (
          <p className={`ml-2 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <span className="material-icons text-xs align-text-top">
              {change >= 0 ? 'arrow_upward' : 'arrow_downward'}
            </span>
            {Math.abs(change).toFixed(1)}%
          </p>
        )}
      </div>
      <div className="mt-4">
        {title === 'Total Audience' && (
          <div className="flex items-center text-xs text-gray-500 space-x-2">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-youtube rounded-full mr-1"></span>
              <span>0</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-instagram rounded-full mr-1"></span>
              <span>0</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-twitter rounded-full mr-1"></span>
              <span>0</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-facebook rounded-full mr-1"></span>
              <span>0</span>
            </div>
          </div>
        )}

        {title === 'Total Engagement' && (
          <div className="h-10">
            <div className="relative h-2 rounded-full overflow-hidden bg-gray-200">
              <div className="absolute h-full bg-youtube" style={{ width: '40%' }}></div>
              <div className="absolute h-full bg-instagram left-[40%]" style={{ width: '35%' }}></div>
              <div className="absolute h-full bg-twitter left-[75%]" style={{ width: '15%' }}></div>
              <div className="absolute h-full bg-facebook left-[90%]" style={{ width: '10%' }}></div>
            </div>
          </div>
        )}

        {title === 'Total Reach' && (
          <div className="mt-4 h-10">
            <div className="w-full h-6 flex">
              <div className="h-full bg-youtube rounded-l-sm" style={{ width: '45%' }}></div>
              <div className="h-full bg-instagram" style={{ width: '30%' }}></div>
              <div className="h-full bg-twitter" style={{ width: '15%' }}></div>
              <div className="h-full bg-facebook rounded-r-sm" style={{ width: '10%' }}></div>
            </div>
          </div>
        )}

        {title === 'Content Performance' && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Below Average</span>
              <span>Above Average</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '0%' }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
