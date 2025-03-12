// frontend/src/components/auth/SuccessStateCard.test.tsx
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import SuccessStateCard from "./SuccessStateCard";
import { AlertTriangle, FileCheck } from "lucide-react";
import { SuccessStateCardProps } from "./SuccessStateCard";
// Helper to render the component with Router
const renderSuccessStateCard = (props: SuccessStateCardProps) => {
  return render(
    <BrowserRouter>
      <SuccessStateCard {...props} />
    </BrowserRouter>
  );
};

describe("SuccessStateCard", () => {
  it("renders title and message correctly", () => {
    renderSuccessStateCard({
      title: "Success Title",
      message: "Success message content",
    });

    expect(screen.getByText("Success Title")).toBeInTheDocument();
    expect(screen.getByText("Success message content")).toBeInTheDocument();
  });

  it("renders optional details when provided", () => {
    renderSuccessStateCard({
      title: "Success",
      message: "Primary message",
      details: "Additional details here",
    });

    expect(screen.getByText("Additional details here")).toBeInTheDocument();
  });

  it("formats message with email when provided", () => {
    renderSuccessStateCard({
      title: "Email Sent",
      message: "We've sent a confirmation to {email}",
      email: "test@example.com",
    });

    // Since the email is rendered with dangerouslySetInnerHTML, we need to look for
    // the container element and check its innerHTML
    const messageElement = screen.getByText(/We've sent a confirmation to/i);
    expect(messageElement.innerHTML).toContain(
      "<strong>test@example.com</strong>"
    );
  });

  it("renders call-to-action button when provided", () => {
    renderSuccessStateCard({
      title: "Success",
      message: "Operation completed",
      cta: {
        label: "Go to Dashboard",
        to: "/dashboard",
      },
    });

    const ctaButton = screen.getByRole("button", { name: "Go to Dashboard" });
    expect(ctaButton).toBeInTheDocument();

    // Check that the button is wrapped in a Link with the correct to prop
    const linkElement = ctaButton.closest("a");
    expect(linkElement).toHaveAttribute("href", "/dashboard");
  });

  it("renders children content when provided", () => {
    renderSuccessStateCard({
      title: "Success",
      message: "Operation completed",
      children: <div data-testid="custom-content">Custom content here</div>,
    });

    expect(screen.getByTestId("custom-content")).toBeInTheDocument();
    expect(screen.getByText("Custom content here")).toBeInTheDocument();
  });

  it("renders success icon by default", () => {
    const { container } = renderSuccessStateCard({
      title: "Success",
      message: "Operation completed",
    });

    // Since icons are SVGs and difficult to directly test,
    // we can check for the green color class which is used for success
    const iconContainer = container.querySelector(".bg-green-100");
    expect(iconContainer).toBeInTheDocument();
    expect(iconContainer?.firstChild).toHaveClass("text-green-600");
  });

  it("renders error icon when specified", () => {
    const { container } = renderSuccessStateCard({
      title: "Error",
      message: "Operation failed",
      icon: "error",
    });

    // Check for the red color class which is used for error
    const iconContainer = container.querySelector(".bg-red-100");
    expect(iconContainer).toBeInTheDocument();
    expect(iconContainer?.firstChild).toHaveClass("text-red-600");
  });

  it("renders warning icon when specified", () => {
    const { container } = renderSuccessStateCard({
      title: "Warning",
      message: "Proceed with caution",
      icon: "warning",
    });

    // Check for the yellow color class which is used for warning
    const iconContainer = container.querySelector(".bg-yellow-100");
    expect(iconContainer).toBeInTheDocument();
    expect(iconContainer?.firstChild).toHaveClass("text-yellow-600");
  });

  it("renders mail icon when specified", () => {
    const { container } = renderSuccessStateCard({
      title: "Email Sent",
      message: "Check your inbox",
      icon: "mail",
    });

    // Check for the blue color class which is used for mail
    const iconContainer = container.querySelector(".bg-blue-100");
    expect(iconContainer).toBeInTheDocument();
    expect(iconContainer?.firstChild).toHaveClass("text-blue-600");
  });

  it("renders info icon when specified", () => {
    const { container } = renderSuccessStateCard({
      title: "Information",
      message: "Important notice",
      icon: "info",
    });

    // Check for the blue color class which is used for info
    const iconContainer = container.querySelector(".bg-blue-100");
    expect(iconContainer).toBeInTheDocument();
    expect(iconContainer?.firstChild).toHaveClass("text-blue-600");
  });

  it("renders custom icon when provided", () => {
    const { container } = renderSuccessStateCard({
      title: "Custom",
      message: "Custom icon message",
      icon: AlertTriangle,
    });

    // Check that an icon container exists with default styling for custom icons
    const iconContainer = container.querySelector(".bg-blue-100");
    expect(iconContainer).toBeInTheDocument();
    expect(iconContainer?.firstChild).toHaveClass("text-blue-600");
  });

  it("applies custom icon colors when provided", () => {
    const { container } = renderSuccessStateCard({
      title: "Custom Colors",
      message: "Custom colored icon",
      icon: FileCheck,
      iconColor: "text-purple-600",
      iconBgColor: "bg-purple-100",
    });

    // Check for the custom color classes
    const iconContainer = container.querySelector(".bg-purple-100");
    expect(iconContainer).toBeInTheDocument();
    expect(iconContainer?.firstChild).toHaveClass("text-purple-600");
  });
});
