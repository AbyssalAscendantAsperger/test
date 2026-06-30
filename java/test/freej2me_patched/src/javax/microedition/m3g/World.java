/*
	This file is part of FreeJ2ME.

	FreeJ2ME is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	FreeJ2ME is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with FreeJ2ME.  If not, see http://www.gnu.org/licenses/
*/
package javax.microedition.m3g;

public class World extends Group
{

	private Camera camera;
	private Background background;

	public World() { }

	public Camera getActiveCamera() { return camera; }

	public void setActiveCamera(Camera camera) 
	{ 
		removeReference(this.camera);
		this.camera = camera;
		addReference(this.camera);
		if(this.camera != null && this.camera.getParent() == null)
		{
			/*
			 * Compatibility: some commercial M3G assets / game code set a camera as
			 * active without adding it as a World child first. Strict JSR-184 render()
			 * later rejects that camera as not being in the world, and some games then
			 * hit NullPointerException in their addCamera/init path. Attach it here so
			 * active cameras are reachable from the world graph.
			 */
			try { addChild(this.camera); }
			catch(Exception ignored) { }
		}
	}

	public Background getBackground() { return background; }

	public void setBackground(Background background) 
	{
		removeReference(this.background);
		this.background = background;
		addReference(this.background);
	}

}
