interface NavbarProps {
  title: string;
  onBack?: () => void;
  onResetConfig?: () => void;
  projectId?: string;
}

export const Navbar = ({ title, onBack, onResetConfig, projectId }: NavbarProps) => {
  return (
    <header className="app-navbar">
      <div className="app-navbar__left">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="btn-secondary"
            aria-label="Back to main menu"
          >
            ← Back
          </button>
        )}
        <span className="app-navbar__badge">{title}</span>
      </div>

      <div className="app-navbar__right">
        {projectId && (
          <span className="app-navbar__badge" title="Active Appwrite Project ID">
            Project: {projectId}
          </span>
        )}
        {onResetConfig && (
          <button
            type="button"
            onClick={onResetConfig}
            className="btn-secondary"
          >
            Settings
          </button>
        )}
      </div>
    </header>
  );
};
