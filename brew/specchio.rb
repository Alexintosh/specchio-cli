# typed: true
# frozen_string_literal: true

class SpecchioSetup < Formula
  desc "Interactive setup CLI for Specchio iOS development environment"
  homepage "https://github.com/Alexintosh/specchio"
  url "https://github.com/Alexintosh/specchio.git",
      tag:      "v1.0.0",
      revision: "HEAD"
  license "MIT"

  bottle do
    root_url "https://github.com/Alexintosh/specchio/releases/download/v1.0.0"
    sha256 cellar: :any_skip_relocation, arm64_sonoma:   "2ed59c5b49ee395f987c836d5a84c3cdadf1c03a03e9036f71ace514c5855ab0"
    sha256 cellar: :any_skip_relocation, arm64_ventura:  "2ed59c5b49ee395f987c836d5a84c3cdadf1c03a03e9036f71ace514c5855ab0"
    sha256 cellar: :any_skip_relocation, arm64_monterey: "2ed59c5b49ee395f987c836d5a84c3cdadf1c03a03e9036f71ace514c5855ab0"
    sha256 cellar: :any_skip_relocation, x86_64_sonoma:   "881a7780e3d8928add5c3f902ffd95f11ff13ae12c6364a597b26bb6a50e2050"
    sha256 cellar: :any_skip_relocation, x86_64_ventura:  "881a7780e3d8928add5c3f902ffd95f11ff13ae12c6364a597b26bb6a50e2050"
    sha256 cellar: :any_skip_relocation, x86_64_monterey: "881a7780e3d8928add5c3f902ffd95f11ff13ae12c6364a597b26bb6a50e2050"
  end

  depends_on "bun"

  def install
    bin.install "cli/specchio" => "specchio"
  end

  test do
    assert_match "Specchio Setup CLI", shell_output("#{bin}/specchio --version", 1)
    assert_match "Interactive setup CLI for Specchio", shell_output("#{bin}/specchio --help", 1)
  end
end
