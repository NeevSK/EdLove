# To learn more about how to use Nix to configure your environment
# see: https://firebase.google.com/docs/studio/customize-workspace
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-24.05"; # or "unstable"

  # Use https://search.nixos.org/packages to find packages
  packages = [
    # pkgs.go
    # pkgs.python311
    # pkgs.python311Packages.pip
    pkgs.nodejs_20
    pkgs.pnpm
    # pkgs.nodePackages.nodemon
  ];

  # Sets environment variables in the workspace
  env = {};

  # Defines a script to run when the workspace starts
  # startup.script = ''
  #   echo "Hello, World!"
  # '';

  # To automatically install packages using your package manager,
  # uncomment the line that corresponds to your package manager
  # and remove any other installation scripts.
  #
  #
  # startup.pnpm.install = true;
  #
  # startup.npm.install = true;
  #
  # startup.yarn.install = true;
  #
  # startup.pip.install = true;
  #
  # startup.go.install = true;
  #
  # Or, specify your own installation script.
  # startup.script = ''
  #  npm install
  # '';

  # To show a file on startup, add a path to the file
  # and uncomment the line below.
  #
  # openFile = ["README.md"];
}
