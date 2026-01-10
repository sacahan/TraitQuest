import { useGoogleAuth } from '../../hooks/useGoogleAuth';

interface CustomGoogleAuthButtonProps {
  className?: string;
  children: React.ReactNode;
}

const CustomGoogleAuthButton = ({ className, children }: CustomGoogleAuthButtonProps) => {
  const { login } = useGoogleAuth();

  return (
    <button onClick={() => login()} className={className}>
      {children}
    </button>
  );
};

export default CustomGoogleAuthButton;
