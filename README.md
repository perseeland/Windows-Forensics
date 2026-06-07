# Windows Forensics Notes

A static, browser-based reference for Windows DFIR (digital forensics & incident
response). Each page covers a forensic artefact or log source with key concepts,
event IDs, and ready-to-copy tool commands.

## Contents

- **Investigation** — interactive checklist (progress saved in your browser)
- **Collection** — data collection, disk analysis intro
- **Registry** — registry overview, system information, users
- **User Behaviour** — UserAssist, RecentDocs, ShellBags
- **Disk Analysis** — `$MFT`, USN Journal
- **Evidence of Execution** — BAM, ShimCache, Amcache, Prefetch
- **Persistence** — Run keys, Startup folders, Services, Scheduled Tasks
- **Event Log Analysis** — Windows Defender, Service Installs, Authentication,
  PowerShell, Sysmon, RDP

## Features

- Collapsible sections and a persistent sidebar
- Copy-to-clipboard buttons on every command
- Input bars that auto-fill commands with your **username**, **drive**, and
  **MFT entry** (values persist across pages)

## Usage

Open `index.html` in any modern browser — it's fully static (HTML/CSS/JS), no
build step or server required.

## Disclaimer

These are personal study notes for educational and authorised investigative use
only. Verify commands and paths against the official tool documentation before
relying on them in a real case.
