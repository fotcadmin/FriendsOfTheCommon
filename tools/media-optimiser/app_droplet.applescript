on run
	set theChoice to button returned of (display dialog "Drag and drop photos or videos onto this app to optimise them for the Friends of the Commons website." & linefeed & linefeed & "Or click 'Choose Files' to select media now." with title "Web Media Optimiser" buttons {"Cancel", "Choose Files..."} default button "Choose Files..." with icon note)
	if theChoice is "Choose Files..." then
		set chosenFiles to (choose file with prompt "Select images or videos to optimise:" with multiple selections allowed without invisibles)
		processFiles(chosenFiles)
	end if
end run

on open dropped_items
	processFiles(dropped_items)
end open

on processFiles(theFiles)
	-- Get POSIX path to the python optimisation script bundled with or located near this app
	set scriptPath to POSIX path of ((path to me as text) & "Contents:Resources:optimise.py")
	
	-- Fallback if running outside a bundled app package
	tell application "Finder"
		if not (exists POSIX file scriptPath) then
			-- Look in current directory or user home
			set scriptPath to POSIX path of ((path to me as text) & "::optimise.py")
		end if
	end tell
	
	-- Build argument list with proper escaping
	set argList to ""
	repeat with anItem in theFiles
		set posixItem to POSIX path of anItem
		set argList to argList & " " & quoted form of posixItem
	end repeat
	
	-- Show progress notification
	display notification "Optimising media for web, please wait..." with title "Web Media Optimiser"
	
	-- Run Python script with extended PATH for ffmpeg and python
	try
		set pyFindCmd to "for p in /opt/homebrew/bin/python3 /usr/local/bin/python3 /Library/Frameworks/Python.framework/Versions/*/bin/python3 /usr/bin/python3; do if [ -x \"$p\" ] && \"$p\" -c 'import PIL' 2>/dev/null; then echo \"$p\"; exit 0; fi; done; echo /usr/bin/python3"
		set pythonBin to do shell script pyFindCmd
		set cmd to "export PATH=\"/opt/homebrew/bin:/usr/local/bin:$PATH\"; " & quoted form of pythonBin & " " & quoted form of scriptPath & argList
		set pyOutput to do shell script cmd
		
		if pyOutput starts with "SUCCESS" then
			-- Parse output: SUCCESS|count|orig_size|new_size|pct|out_dir
			set AppleScript's text item delimiters to "|"
			set parts to text items of pyOutput
			set fileCount to item 2 of parts
			set origSize to item 3 of parts
			set newSize to item 4 of parts
			set pctSaved to item 5 of parts
			set outDir to item 6 of parts
			set AppleScript's text item delimiters to ""
			
			-- Display success notification
			display notification "Saved " & pctSaved & " (" & origSize & " → " & newSize & ")" with title "Web Media Optimiser" subtitle (fileCount & " file(s) ready for Decap CMS!") sound name "Glass"
			
			-- Open output folder in Finder
			do shell script "open " & quoted form of outDir
		else
			display alert "Optimisation Result" message pyOutput as informational
		end if
	on error errMsg
		display alert "Media Optimisation Error" message errMsg as critical
	end try
end processFiles
