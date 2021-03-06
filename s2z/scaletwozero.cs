//
// scaletwozero.cs
//
// An extension (and name steal) of Scale to Zero by ShadowMarble, this plugin
// simplifies making complex curves by combining pairs of vertices. It will
// find the closest pairs of vertices and merge them together, with options for
// weighting the various axes for different output.
//
// The instance makes use of the following dynamic fields:
// static    - Points to the static ScriptObject
// dirty     - Flag to indicate that the tool needs to be refreshed on screen
// active    - Flag to indicate that the tool is active, draw its handles, and interact with the user
// update    - Store a value to be returned to Constructor when asked about the tool's edit state, such as do nothing or update with new settings, etc.
//
// Revision History:
// June     21, 2009  ShadowMarble  Created original Scale to Zero script
// December 12, 2014     HiGuy      Created script file
// February 22, 2015     HiGuy      Fixed algorithm to group near vertices and scale them all at once
//

package ScaleTwoZero
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
		error("ScaleTwoZero: Activate(" @ %version @ "," @ %inst @ "," @ %static @ ")");

      //*** Check for a valid version
      if(%version != 1)
      {
         return tool.FUNC_BADVERSION();
      }

      //*** Build the tool's instance
      %plugin = new ScriptObject();

      //*** This plugin doesn't make use of static data but we still need to
      //*** assign it.
      %plugin.static = %static;
      ScaleTwoZero_reset(%plugin);

      //*** Setup some additional attributes for the instance
      %plugin.dirty = tool.DIRTY_NONE();
      %plugin.active = true;
      %plugin.update = tool.EDIT_DONOTHING();
      //ScaleTwoZero_Reset(%plugin);

      //*** Pass along the instance
      %inst.instance = %plugin;
      %inst.flagsInterface = tool.IFLAG_STANDARDGEOMETRY() + tool.IFLAG_DRAWALLSAME(); // Set up the tool with the standard geometry creation GUI and all views to use the same drawing buffer.  Our Draw() will only be called once.
      %inst.flagsApply = tool.AFLAG_NONE();

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
		//error("ScaleTwoZero: Done(" @ %inst @ "," @ %static @ ")");

      %plugin = %inst.instance;

      if(%plugin)
      {
         //*** Delete our instance
         %plugin.delete();
         %inst.instance = 0;
      }
   }

   //************************************************************************************
   // Dirty()
   //
   // This function is called to determine if the tool needs to be redrawn.  Return a
   // combination of the tool.DIRTY_* flags added together to indicate that the tool's
   // features (but not geometry) should be redrawn.
   function Plugin::Dirty(%this, %inst)
   {
		//error("ScaleTwoZero: Dirty(" @ %inst @ ")");

      %plugin = %inst.instance;

      return %plugin.dirty ? tool.DIRTY_APPEARANCE() : tool.DIRTY_NONE();
   }

   //************************************************************************************
   // Draw()
   //
   // This function is called to draw the tool itself.  Geometry is not built here but
   // in BuildGeometry().  The %draw parameter points to the ToolDrawing class
   // and is used to build up the tool's wireframe.  Just before this function is called,
   // Constructor will clear the draw buffer, so the tool is responsible for recreating
   // the tool's appearance.  This function may be called multiple times, once for each
   // view type.  The %draw.getView(); function returns the current view type.  The tool
   // is not required to do anything different for each view type and may send the same drawing
   // commands on each call to this function, although it may be wise to treat the UV view
   // as a special case.  Draw() does not return a value.
   function Plugin::Draw(%this, %inst, %draw)
   {
		//error("ScaleTwoZero: Draw(" @ %inst @ "," @ %draw @ ")");

      %plugin = %inst.instance;

      //*** If the tool is not active, then don't draw it
      if(!%plugin.active)
         return;

      //*** Indicate that we've drawn the tool
      %plugin.dirty = tool.DIRTY_NONE();
   }

   //************************************************************************************
   // CheckEditAction()
   //
   // This function is called to determine how to handle the tool's geometry.  Return
   // one of the tool.EDIT_* flags to indicate how to modify the geometry based on the
   // latest change.
   function Plugin::CheckEditAction(%this, %inst)
   {
		//error("ScaleTwoZero: CheckEditAction(" @ %inst @ ")");

      %plugin = %inst.instance;

      return %plugin.update;
   }

   //************************************************************************************
   // EndEditAction()
   //
   // This function is called after the completion of a mouse down to mouse drag to mouse
   // up sequence.  This may be called a number of times.  The %keep parameter is set
   // based on what is returned from the CheckEditAction() function.  This function
   // does not return a value.
   function Plugin::EndEditAction(%this, %inst, %keep)
   {
		//error("ScaleTwoZero: EndEditAction(" @ %inst @ "," @ %keep @ ")");

      %plugin = %inst.instance;

      //*** If we're to keep the operation, then trigger the work
      if(%keep)
      {
         //*** Perform the hollow by forcing an update
         %plugin.update = tool.EDIT_UPDATE();
         %plugin.dirty = tool.DIRTY_APPEARANCE();
         tool.refresh();

         //scene.notifyBrushRefresh();
      }

      %plugin.update = tool.EDIT_DONOTHING();
      %plugin.active = false;

   }

   //************************************************************************************
   // BuildGeometry()
   //
   // This function is called to build/edit the tool's actual geometry.  %edit points to
   // the geometry edit operation structure.  Return a Tool Return Function to indicate
   // success of the tool's operation on the geometry.
   function Plugin::BuildGeometry(%this, %inst, %edit)
   {
		//error("ScaleTwoZero: BuildGeometry(" @ %inst @ "," @ %edit @ ")");

      %plugin = %inst.instance;
      %ret = TOOL.FUNC_OK();

      //*** Scale the geometry if we're active.
      if(%plugin.active)
      {
         %offset = !%plugin.static.axis[0] SPC !%plugin.static.axis[1] SPC !%plugin.static.axis[2];
         %mod = %plugin.static.mod[0] SPC %plugin.static.mod[1] SPC %plugin.static.mod[2];

      	%ret = ScaleTwoZero_activate(%edit, %offset, %plugin.static.lower, %mod);
      }

      //*** As we've now worked on the geometry, set the edit update indicator to do nothing.
      %plugin.update = tool.EDIT_DONOTHING();

      return %ret;
   }

   //************************************************************************************
   // UserEvent()
   //
   // This function is called when the user does something to the tool, such as activate
   // it or reset it.  %userevent is the event that the user caused.  This function does
   // not return a value.
   function Plugin::UserEvent(%this, %inst, %userevent)
   {
		//error("ScaleTwoZero: UserEvent(" @ %inst @ "," @ %userevent @ ")");

      %plugin = %inst.instance;

      switch(%userevent)
      {
         //*** User activated the tool such that we should continue to use the current
         //*** settings (ie: same centre and size).  This is different from the user
         //*** clicking in the 3D interface to draw a new object.
         case tool.EVENT_ACTIVATE():
            %plugin.update = tool.EDIT_UPDATE();
            %plugin.active = true;
            %plugin.dirty = tool.DIRTY_APPEARANCE();

         //*** The user has asked that the tool be reset back to its default values/settings.
         case tool.EVENT_RESET():
            ScaleTwoZero_Reset(%plugin);
            %plugin.update = tool.EDIT_UPDATE();
            %plugin.active = true;
            %plugin.dirty = tool.DIRTY_APPEARANCE();

         //*** The user has deactivated the tool.  If the tool is active, then we tell
         //*** Constructor to reject any interactive action that is partly complete.  This
         //*** will discard any geometry the tool has created.
         case tool.EVENT_DEACTIVATE():
            if(%plugin.active)
            {
               %plugin.update = tool.EDIT_REJECT();
            }
            %plugin.dirty = tool.DIRTY_APPEARANCE();
      }
   }

   //************************************************************************************
   // Interface()
   //
   // This function sets up the GUI for the tool to allow the user to change the tool's
   // parameters.  %form points to the interface construction class that this function
   // makes calls to when building the interface.  This function does not return a value.
   function Plugin::Interface(%this, %inst, %form)
   {
		//error("ScaleTwoZero: Interface(" @ %inst @ "," @ %form @ ")");

      %plugin = %inst.instance;

      //*** Provide a title
      %form.defineTitle("Scale two Zero");

      //*** Add our fields to the form in the order we wish them displayed.  A field
      //*** with an ID of -1 will not have a value get/set.
      %form.addField(-1, "Axis",        "Divider");
      %form.addField( 0, "Axis X",      "checkbox");
      %form.addField( 1, "Axis Y",      "checkbox");
      %form.addField( 2, "Axis Z",      "checkbox");
      %form.addField(-1, "Opitions",    "Divider");
      %form.addField( 3, "Lower Bound", "numeric");
      %form.addField( 4, "X Modifier",  "numeric");
      %form.addField( 5, "Y Modifier",  "numeric");
      %form.addField( 6, "Z Modifier",  "numeric");
   }

   //************************************************************************************
   // InterfaceGet()
   //
   // This function is called to retrieve a value from the tool given the field's ID
   // in %id.  The value of the field is then returned.
   function Plugin::InterfaceGet(%this, %inst, %id)
   {
		//error("ScaleTwoZero: InterfaceGet(" @ %inst @ "," @ %id @ ")");

      %plugin = %inst.instance;

      switch (%id) {
      case 0 or 1 or 2:
	      return %plugin.static.axis[%id];
	   case 3:
	   	return %plugin.static.lower;
	   case 4 or 5 or 6:
	   	return %plugin.static.mod[%id - 4];
      }
   }

   //************************************************************************************
   // InterfaceSet()
   //
   // This function is called to set a value for the tool given the field's ID
   // in %id, and the value to set to in %value.  This function returns tool.FUNC_OK();
   // if the value was accepted.  Otherwise it returns tool.FUNC_BADVALUE(); to indicate
   // that the given value is invalid and the correct value should be retrieved from the
   // tool once again.
   function Plugin::InterfaceSet(%this, %inst, %id, %value)
   {
      //error("ScaleTwoZero: InterfaceSet(" @ %inst @ "," @ %id @ "," @ %value @")");

      %plugin = %inst.instance;

      switch (%id) {
      case 0 or 1 or 2:
			%plugin.static.axis[%id] = %value < 0 ? 0 : %value;
	   case 3:
			%plugin.static.lower = %value;
		case 4 or 5 or 6:
			%plugin.static.mod[%id - 4] = %value;
      }

      return tool.FUNC_OK();
   }


   //************************************************************************************
   //*** Tool Specific Functions
   //************************************************************************************

   //*** Reset the transform instance to default values
   function ScaleTwoZero_Reset(%plugin, %angleonly)
   {
      %plugin.static.axis[0] = 0;
      %plugin.static.axis[1] = 0;
      %plugin.static.axis[2] = 0;
      %plugin.static.lower = 0.001;
      %plugin.static.mod[0] = 1;
      %plugin.static.mod[1] = 1;
      %plugin.static.mod[2] = 1;
   }

	//*** Preform the operation
	function ScaleTwoZero_activate(%edit, %offset, %minDist, %mod) {
		//Get the scene / map for using
		%scene = scene.getCurrent();
		%map = scene.getCurrentMap();

		//This tool only works in vertex selection mode
		if (select.getSelectionType() !$= "SelectVertices")
			return tool.FUNC_BADSELECTMODE();

		//List of selected vertices
		%vertlist = %map.getSelectedVertices();
		%verts = 0;

		if (getWordCount(%vertlist) > 1000) {
			%edit.openProgressDialog("Scale two Zero");
			%showProgress = 1;
			%nextProgress = 0.05;
		}

		%indices = 0;
		%wordCount = getWordCount(%vertlist);

		//Get all vertex information into a list
		for (%i = 0; %i < %wordCount; %i += 2) {
			//Vertex information
			%brush = getWord(%vertlist, %i);
			%index = getWord(%vertlist, %i + 1);

			//Vert position is relative to brush position
			%brushPos = %map.getBrushTransform(%brush);
			%vertPos = %map.getVertexPosition(%brush, %index);
			%combined = MatrixMulPoint(%brushPos, %vertPos);

			%location = -1;
			for (%j = 0; %j < %verts; %j ++) {
				if (VectorDist(%vertPos[%j], %combined) < %minDist) {
					%location = %j;
					break;
				}
			}
			//If we don't have any vertices yet at this point, we can add it to the list
			if (%location == -1) {
				//Store into variable lists
				%location = %verts;
				%vertpos[%verts] = %combined;
				echo("ScaleTwoZero Unique Vert (" @ %verts @ "): (" @ %combined @ ")");

				%verts ++;
			}
			//Even if we added it to the vert list, we need to mark down its index
			%vertindex[%indices] = %location;
			%vertdata[%indices] = %brush SPC %index;
			%indices ++;

			if (%showProgress && (%i / %wordCount) > %nextProgress) {
				%edit.updateProgressDialog("Scanned " @ (%nextProgress * 100) @ "% of " @ (%wordCount / 2) @ " vertices", (%i / %wordCount) / 6);
				%nextProgress += 0.05;
			}
		}

		if (%showProgress) {
			%nextProgress = 0.05;
		}

		//# of pairs is 1 + 2 + ... + (verts - 1)
		%pairs = (%verts * (%verts - 1)) / 2;
		%count = 0;

		//Calculate all distances
		for (%i = 0; %i < %verts; %i ++) {
			for (%j = %i + 1; %j < %verts; %j ++) {
				%pos0 = %vertpos[%i];
				%pos1 = %vertpos[%j];

				//Distance between the two points
				if (%mod !$= "1 1 1") {
					//Non-uniform distance
					%d = VectorSub(%pos0, %pos1);

					//VectorScaleComponents(%d, %mod)
					%d = setWord(%d, 0, getWord(%d, 0) * getWord(%mod, 0));
					%d = setWord(%d, 1, getWord(%d, 1) * getWord(%mod, 1));
					%d = setWord(%d, 2, getWord(%d, 2) * getWord(%mod, 2));
					%distance = VectorLen(%d);
				} else {
					%distance = VectorDist(%pos0, %pos1);
				}

				//Don't combine two points if they're already together
				if (%distance <= %minDist)
					continue;

				//Linked array
				%distances[%i, %j] = %distance;

				echo("ScaleTwoZero: Vert Distances (" @ %i @ " [" @ %pos0 @ "], " @ %j @ " [" @ %pos1 @ "]) = (" @ %distance @ ")");

				%count ++;
				if (%showProgress && (%count / %pairs) > %nextProgress) {
					%edit.updateProgressDialog("Calculated " @ (%nextProgress * 100) @ "% of " @ %pairs @ " vertex distances", 0.13 + (%count / %pairs) / 6);
					%nextProgress += 0.05;
				}
			}
		}

		if (%showProgress) {
			%nextProgress = 0.05;
		}

		//Calculate closest pairs, sort by distance
		for (%i = 0; %i < %pairs; %i ++) {
			%closest = "-1";
			%closestDistance = -1;

			for (%j = 0; %j < %verts; %j ++) {
				//As we only use each vert once, we can skip the loop
				if (%used[%j])
					continue;

				for (%k = %j + 1; %k < %verts; %k ++) {
					//As we only use each vert once, we can skip the loop
					if (%used[%k])
						continue;

					//Simple distance sort
					%distance = %distances[%j, %k];
					if (%distance $= "")
						continue;

					if (%closest $= "-1" || %distance < %closestDistance) {
						%closest = (%j SPC %k);
						%closestDistance = %distance;
					}
				}
			}

			if (%showProgress) {
				%edit.updateProgressDialog("Found closest " @ %i @ " of " @ (%verts / 2) @ " vertex pairs", 0.33 + (%i / (%verts / 2)) / 2);
				%nextProgress += 0.05;
			}

			if (%closest $= "-1") {
				error("ScaleTwoZero: No pair found for pair index " @ %i);

				//At this point, there are no more pairs to make
				%pairs = %i;
				break;
			} else {
				//Record the pair in the list and mark the points as used
				%pairs[%i] = %closest;
				%used[getWord(%closest, 0)] = true;
				%used[getWord(%closest, 1)] = true;
				echo("ScaleTwoZero: Found pair #" @ %i @ " (" @ %closest @ ") with distance " @ %closestDistance);
			}
		}

		if (%showProgress) {
			%nextProgress = 0.05;
		}

		//Deselect all so we can start editing the geometry
		%map.unselectAllVertices();

		//Combine all the pairs
		for (%i = 0; %i < %pairs; %i ++) {
			%pair = %pairs[%i];
			%vert0 = getWord(%pair, 0);
			%vert1 = getWord(%pair, 1);

			//Select all matching vertices, we can scale them together in bulk
			%vertList = "";
			for (%j = 0; %j < %indices; %j ++) {
				if (%vertindex[%j] == %vert0 || %vertindex[%j] == %vert1) {
					if (%vertList $= "")
						%vertList = %vertdata[%j];
					else
						%vertList = %vertList SPC %vertdata[%j];
				}
			}
			//Deselect all first!
			%map.unselectAllVertices();
			%map.selectVertices(%vertList);

			//Find the center point and scale them all together
			%center = VectorScale(VectorAdd(%vertpos[%vert0], %vertpos[%vert1]), 0.5);
			%map.scaleSelectedVerticesRelBuf(%offset, %center);

			echo("ScaleTwoZero: Center:" SPC %center);

			if (%showProgress && (%i / %pairs) > %nextProgress) {
				%edit.updateProgressDialog("Combined " @ (%nextProgress * 100) @ "% of " @ %pairs @ " vertex matches", 0.83 + (%i / %pairs) / 6);
				%nextProgress += 0.05;
			}
		}

		//Reselect all the vertices
		%map.unselectAllVertices();
		for (%i = 0; %i < %verts; %i ++) {
			if (!%used[%i]) {
				error("ScaleTwoZero: Unused vertex " @ %i @ ". Probably an odd-numbered selection.");
			} else {
				//Select the verts again
				%pair = %pairs[%i];
				%vert0 = getWord(%pair, 0);
				%vert1 = getWord(%pair, 1);

				%index0 = %vertindex[%vert0];
				%index1 = %vertindex[%vert1];

				//Select the vertices
				%vertList = %index0 SPC %index1;
				%map.selectVertices(%vertList);
			}
		}

		if (%showProgress) {
			%edit.closeProgressDialog();
		}

		return tool.FUNC_OK();
	}
};

tool.register("ScaleTwoZero", tool.typeInteractive(), tool.RFLAG_STORETRANSFORMS() + tool.RFLAG_ALLOWNONMODALSELECTION(), "Scale Two Zero" );
tool.setToolProperty("ScaleTwoZero", "Icon", "ScaleTwoZero");
tool.setToolProperty("ScaleTwoZero", "Group", "Most Useful Tools Ever");
