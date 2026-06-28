{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  nativeBuildInputs = [
    pkgs.nodejs_26
    pkgs.pnpm
    pkgs.pocketbase
  ];
}
