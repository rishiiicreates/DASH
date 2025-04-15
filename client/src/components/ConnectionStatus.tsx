interface ConnectionStatusProps {
  platform: 'youtube' | 'instagram' | 'twitter' | 'facebook';
  status: 'connected' | 'setup-needed' | 'not-connected';
  label: string;
  icon: string;
}

export default function ConnectionStatus({ platform, status, label, icon }: ConnectionStatusProps) {
  // Platform-specific styling
  const getStyles = () => {
    switch (platform) {
      case 'youtube':
        return {
          textColor: 'text-youtube',
          bgColor: 'bg-youtube',
          bgOpacity: 'bg-opacity-10',
        };
      case 'instagram':
        return {
          textColor: 'text-instagram',
          bgColor: 'bg-instagram',
          bgOpacity: 'bg-opacity-10',
        };
      case 'twitter':
        return {
          textColor: 'text-twitter',
          bgColor: 'bg-twitter',
          bgOpacity: 'bg-opacity-10',
        };
      case 'facebook':
        return {
          textColor: 'text-facebook',
          bgColor: 'bg-facebook',
          bgOpacity: 'bg-opacity-10',
        };
    }
  };

  const styles = getStyles();

  // Status styling and text
  const getStatusStyle = () => {
    switch (status) {
      case 'connected':
        return {
          dotColor: 'bg-green-500',
          text: 'Connected',
        };
      case 'setup-needed':
        return {
          dotColor: 'bg-yellow-500',
          text: 'Setup Needed',
        };
      case 'not-connected':
        return {
          dotColor: 'bg-red-500',
          text: 'Not Connected',
        };
    }
  };

  const statusStyle = getStatusStyle();

  return (
    <div className="border border-gray-200 rounded-lg p-4 flex items-center">
      <div className={`w-10 h-10 flex items-center justify-center ${styles.bgColor} ${styles.bgOpacity} rounded-lg mr-4`}>
        <span className={`material-icons ${styles.textColor}`}>{icon}</span>
      </div>
      <div className="flex-1">
        <h4 className="font-medium">{label}</h4>
        <div className="flex items-center mt-1">
          <span className={`inline-block w-2 h-2 rounded-full ${statusStyle.dotColor} mr-1`}></span>
          <span className="text-xs text-gray-600">{statusStyle.text}</span>
        </div>
      </div>
    </div>
  );
}
