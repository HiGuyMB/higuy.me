//
// PlatformAssist.cs
//
// Simple Generic tool that pops up a window.  This plug-in doesn't define
// an icon or a group so uses the default for both when displayed within
// the User tab of the Tools Form.
//
// Revision History:
// March 30, 2015			HiGuy Smith		Created script file
// October 28, 2015		HiGuy Smith		Fixed brush type not setting

package PlatformAssist
{
   //************************************************************************************
   //*** Standard Tool Functions
   //************************************************************************************

   //************************************************************************************
   // Activate()
   //
   // Called when the tool is activated.  %version holds the current version of this
   // tool type in Constructor to allow the tool to step down features if required.
   // %inst is actually a ScriptObject behind the scenes that allows for the tool's
   // instance to be attached to it -- which is typically a ScriptObject itself.
   // %static is a ScriptObject that allows anything to be attached to it that will
   // presist across tool instances.
   // Return a Tool Return Function to indicate success of the tool's activation.
   function Plugin::Activate(%this, %version, %inst, %static)
   {
      //error("PlatformAssist: Activate(" @ %version @ "," @ %inst @ "," @ %static @ ")");

      //*** Check for a valid version
      if(%version != 1)
      {
         return tool.FUNC_BADVERSION();
      }

      //*** This tool doesn't need to make use of the instance
      %inst.instance = 0;
      %inst.flagsInterface = tool.IFLAG_NONE(); // No special interface flags as there will be no interface
      %inst.flagsApply = tool.AFLAG_NONE();     // No special actions when tool is applied

      //*** Return that everything is OK
      return tool.FUNC_OK();
   }

   //************************************************************************************
   // Done()
   //
   // Called when the user is finished with the tool.  Typically any allocated
   // memory is freed here.  %inst and %static are the same as those in the
   // activation function.  This function does not return a value.
   function Plugin::Done(%this, %inst, %static)
   {
      //error("PlatformAssist: Done(" @ %inst @ "," @ %static @ ")");

      %plugin = %inst.instance;

      if(%plugin)
      {
         //*** Delete our instance
         %plugin.delete();
         %inst.instance = 0;
      }
   }

   //************************************************************************************
   // Execute()
   //
   // This function is called to perform the actual work of the tool, and does not
   // return a value.
   function Plugin::Execute(%this, %inst)
   {
      //error("PlatformAssist: Execute(" @ %inst @ ")");

      %plugin = %inst.instance;

		//Run PlatformAssist
		PlatformAssist_activate(true);
   }
};

if (isObject(PlatformAssistEntityDialog))
	PlatformAssistEntityDialog.delete();

//--- OBJECT WRITE BEGIN ---
new GuiControl(PlatformAssistEntityDialog) {
   canSaveDynamicFields = "1";
   profile = "GuiDefaultProfile";
   horizSizing = "right";
   vertSizing = "bottom";
   position = "0 0";
   extent = "640 480";
   minExtent = "8 2";
   visible = "1";
   noFocusOnWake = "0";
   tabsCannotEscape = "0";
   ignoreMouse = "1";

   new GuiWindowCtrl() {
      canSaveDynamicFields = "1";
      profile = "GuiWindowProfile";
      horizSizing = "center";
      vertSizing = "center";
      position = "192 102";
      extent = "270 260";
      minExtent = "270 260";
      visible = "1";
      noFocusOnWake = "0";
      tabsCannotEscape = "0";
      ignoreMouse = "0";
      text = "Choose a Entity Class";
      maxLength = "255";
      resizeWidth = "1";
      resizeHeight = "1";
      canMove = "1";
      canClose = "1";
      canMinimize = "1";
      canMaximize = "1";
      minSize = "270 300";
      closeCommand = "PlatformAssistEntityDialogCancel();";

		new GuiTextCtrl() {
         canSaveDynamicFields = "1";
         profile = "GuiTextProfile";
         horizSizing = "center";
         vertSizing = "bottom";
         position = "70 30";
         extent = "130 18";
         minExtent = "8 2";
         visible = "1";
         noFocusOnWake = "0";
         tabsCannotEscape = "0";
         ignoreMouse = "0";
         text = "Multiple Entity Types Found";
         maxLength = "255";
		};
      new GuiScrollCtrl() {
         canSaveDynamicFields = "1";
         profile = "GuiScrollProfile";
         horizSizing = "width";
         vertSizing = "height";
         position = "10 55";
         extent = "250 165";
         minExtent = "8 2";
         visible = "1";
         noFocusOnWake = "0";
         tabsCannotEscape = "0";
         ignoreMouse = "0";
         willFirstRespond = "1";
         hScrollBar = "dynamic";
         vScrollBar = "alwaysOn";
         constantThumbHeight = "0";
         childMargin = "0 0";
         contentExtent = "228 186";
         bodyScrolling = "1";

         new GuiTextListCtrl(PlatformAssistEntityDialogTextList) {
            canSaveDynamicFields = "1";
            profile = "GuiTextListProfile";
            horizSizing = "right";
            vertSizing = "bottom";
            position = "2 2";
            extent = "228 16";
            minExtent = "8 2";
            visible = "1";
            noFocusOnWake = "0";
            tabsCannotEscape = "0";
            ignoreMouse = "0";
            enumerate = "0";
            resizeCell = "1";
            columns = "0";
            fitParentWidth = "1";
            clipColumnText = "0";
            boxInInactive = "0";
         };
      };
      new GuiIconButtonCtrl() {
         canSaveDynamicFields = "1";
         profile = "GuiIconButtonFixedLargeProfile";
         horizSizing = "left";
         vertSizing = "top";
         position = "10 225";
         extent = "70 21";
         minExtent = "8 2";
         visible = "1";
         noFocusOnWake = "0";
         tabsCannotEscape = "0";
         command = "PlatformAssistEntityDialogOK();";
         ignoreMouse = "0";
         text = "OK";
         groupNum = "-1";
         buttonType = "PushButton";
         sizeBitmapToButton = "0";
         textLocation = "Center";
         textMargin = "0";
         buttonMargin = "2 2";
      };
      new GuiIconButtonCtrl() {
         canSaveDynamicFields = "1";
         profile = "GuiIconButtonFixedLargeProfile";
         horizSizing = "left";
         vertSizing = "top";
         position = "190 225";
         extent = "70 21";
         minExtent = "8 2";
         visible = "1";
         noFocusOnWake = "0";
         tabsCannotEscape = "0";
         command = "PlatformAssistEntityDialogCancel();";
         ignoreMouse = "0";
         text = "Cancel";
         groupNum = "-1";
         buttonType = "PushButton";
         sizeBitmapToButton = "0";
         textLocation = "Center";
         textMargin = "0";
         buttonMargin = "2 2";
      };
   };
};
//--- OBJECT WRITE END ---

function PlatformAssistEntityDialogOK() {
	Canvas.popDialog(PlatformAssistEntityDialog);

	//Put everyone into this entity
	%entity = PlatformAssistEntityDialogTextList.getSelectedId();
	%type = getField(PlatformAssistEntityDialogTextList.getRowTextById(%entity), 2);

	//If they didn't select anything, bail
	if (%entity == -1) {
		return;
	}

	//Which map?
	if (PlatformAssistEntityDialog.map $= "") {
		%map = Scene.getCurrentMap();
	} else {
		%map = PlatformAssistEntityDialog.map;
		PlatformAssistEntityDialog.map = "";
	}

	//What selection?
	if (PlatformAssistEntityDialog.selection $= "") {
		%selection = %map.getSelectedBrushes();
	} else {
		%selection = PlatformAssistEntityDialog.selection;
		PlatformAssistEntityDialog.selection = "";
	}

	error("!!! PlatformAssist combining selection (" @ %selection @ ") into entity: " @ %entity @ " type: " @ %type @ " !!!");

	//Run
	PlatformAssist_fix(%map, %selection, %entity, %type);
}

function PlatformAssistEntityDialogCancel() {
	Canvas.popDialog(PlatformAssistEntityDialog);
}

function PlatformAssist_activate(%ask, %selection) {
	//Get map and selection
	%map = Scene.getCurrentMap();
	if (%selection $= "") {
		%selection = %map.getSelectedBrushes();
	}

	if (%ask) {
		%entities = PlatformAssist_getBrushEntities(%map, %selection);
		error("!!! PlatformAssist entities: " @ %entities @ " !!!");

		//Trying to combine objects that are all in the same entity? Whatever.
		if (getFieldCount(%entities) < 2) {
			//Ignore them
			return;
		}

		//Clear list
		PlatformAssistEntityDialogTextList.clear();

		//Add all the items to the list
		%count = getFieldCount(%entities);
		for (%i = 0; %i < %count; %i ++) {
			//Current entity
			%entity = getWord(getField(%entities, %i), 0);
			%type = getWord(getField(%entities, %i), 1);
			%className = %map.getEntityClassname(%entity);

			//Add it to the list
			PlatformAssistEntityDialogTextList.addRow(%entity, %entity @ " - " @ %className TAB %entity TAB %type);
		}

		//Sort it
		PlatformAssistEntityDialogTextList.sortNumerical(1, true);
		PlatformAssistEntityDialog.map = %map;
		PlatformAssistEntityDialog.selection = %selection;

		//Show them the dialog!
		Canvas.pushDialog(PlatformAssistEntityDialog);
	} else {
		if (getWordCount(%selection) < 2) {
			//Ignore them
			return;
		}

		%largest = 0;
		%brushNum = 0;

		//Find the largest entity ID (to fix 0-brush entity problems)
		%count = getWordCount(%selection);
		for (%i = 0; %i < %count; %i ++) {
			%brush = getWord(%selection, %i);
			%group = %map.getBrushOwner(%brush);

			//Largest one wins
			if (%group > %largest) {
				%largest = %group;
				%brushNum = %brush;
			}
		}

		//Pick the largest
		%group = %map.getBrushOwner(%brushNum);
		%type  = %map.getBrushType (%brushNum);

		error("!!! PlatformAssist combining selection (" @ %selection @ ") into entity: " @ %group @ " type: " @ %type @ " !!!");

		//Run
		PlatformAssist_fix(%map, %selection, %group, %type);
	}
}

function PlatformAssist_fix(%map, %selection, %group, %type) {
	//Update the rest of the brushes
	%count = getWordCount(%selection);
	for (%i = 0; %i < %count; %i ++) {
		%brush = getWord(%selection, %i);
		%owner = %map.getBrushOwner(%brush);

		//If the brush is already part of the entity, don't add it again
		if (%owner == %group)
			continue;

		//Add the brush to the entity
		%map.setBrushOwner(%brush, %group);
		%map.setBrushType(%brush, %type);
	}
}

function PlatformAssist_getBrushEntities(%map, %selection) {
	//Ask them which entity should be used
	%entities = "";
	%types = "";

	//Update the rest of the brushes
	%count = getWordCount(%selection);
	for (%i = 0; %i < %count; %i ++) {
		%brush = getWord(%selection, %i);

		%entity = %map.getBrushOwner(%brush);
		%type = %map.getBrushType(%brush);

		//Check if that entity is in %entities yet
		%found = false;
		%ocount = getFieldCount(%entities);
		for (%j = 0; %j < %ocount; %j ++) {
			//Simple string comparison
			if (getWord(getField(%entities, %j), 0) $= %entity) {
				%found = true;
				break;
			}
		}

		//If we've already seen this entity, skip it
		if (%found)
			continue;

		//Add this entity to the list
		if (%entities $= "") {
			%entities = %entity SPC %type;
		} else {
			%entities = %entities SPC %type TAB %entity;
		}
	}
	return %entities;
}

//Override package so we can inject and hook OtherBrushEntityDialogOK()
// (the method for the OK button on the Other Entity panel).
package PlatformAssistOverride {
	function OtherBrushEntityDialogOK() {
		//Get map and selection
		%map = Scene.getCurrentMap();
		%selection = %map.getSelectedBrushes();

		//Get class
		%parentClassId = OtherBrushEntityDialogTextList.getSelectedId();
		%parentClassName = OtherBrushEntityDialogTextList.getRowTextById(%parentClassId);

		//Should we combine them?
		%combine = false;
		if (%parentClassName $= "Door_Elevator") {
			//Combine them!
			%combine = true;
		}

		//Deselect all brushes except for the first one, so that we do not create
		// extra entities with no brushes.
		if (%combine) {
			select.clearCurrentSelectionType();
			select.addItem(firstWord(%selection));
		}

		//Run this first
		Parent::OtherBrushEntityDialogOK();

		//Now combine them if needed
		if (%combine) {
			PlatformAssist_activate(false, %selection);
		}
	}
	function CSceneManager::save(%this, %scene) {
		Parent::save(%this, %scene);

		%map = scene.getCurrentMap();
		if (%map.getNumEntityChildren(0) == 0) {
			//You have no worldspawns
			MessageBoxOk("Warning", "Worldspawn with no child brushes detected. This may cause issues loading the interior.");
		}
	}
};

//Deactivate first because otherwise constructor yells at us
deactivatePackage(PlatformAssistOverride);

//And inject!
activatePackage(PlatformAssistOverride);

//We also have tool functionality
tool.register("PlatformAssist", tool.typeGeneric(), tool.RFLAG_NONE(), "Platform Assist" );
tool.setToolProperty("PlatformAssist", "Icon", "platformAssist");
tool.setToolProperty("PlatformAssist", "Group", "Most Useful Tools Ever");
