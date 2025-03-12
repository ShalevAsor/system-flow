import React, { ReactNode } from "react";

export type AuthCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
};

const AuthCard: React.FC<AuthCardProps> = ({
  title,
  subtitle,
  children,
  footer,
}) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
      </div>

      {children}

      {footer && <div className="mt-8 text-center text-sm">{footer}</div>}
    </div>
  );
};

export default AuthCard;
