importsString = <<-eos
    java -jar compiler/compiler.jar --compilation_level SIMPLE_OPTIMIZATIONS  --jscomp_off=internetExplorerChecks --js_output_file=js/min/chuclone_min.js


    <script type='text/javascript' src='/game/js/lib/DAT.GUI.js'></script>
    <script type='text/javascript' src='/game/js/lib/Stats.js'></script>
    <script type='text/javascript' src='/game/js/lib/threejs/build/Three.js'></script>
    <script type='text/javascript' src='/game/js/lib/threejs/examples/js/RequestAnimationFrame.js'></script>
	<script type='text/javascript' src='/game/js/lib/threejs/examples/js/Stats.js'></script>
	<script type='text/javascript' src='/game/js/lib/threejs/examples/js/Detector.js'></script>
	<script type='text/javascript' src='/game/js/lib/threejs/examples/js/postprocessing/BloomPass.js'></script>
	<script type='text/javascript' src='/game/js/lib/threejs/examples/js/postprocessing/DotScreenPass.js'></script>
	<script type='text/javascript' src='/game/js/lib/threejs/examples/js/postprocessing/EffectComposer.js'></script>
	<script type='text/javascript' src='/game/js/lib/threejs/examples/js/postprocessing/FilmPass.js'></script>
	<script type='text/javascript' src='/game/js/lib/threejs/examples/js/postprocessing/MaskPass.js'></script>
	<script type='text/javascript' src='/game/js/lib/threejs/examples/js/postprocessing/RenderPass.js'></script>
	<script type='text/javascript' src='/game/js/lib/threejs/examples/js/postprocessing/ShaderPass.js'></script>
	<script type='text/javascript' src='/game/js/lib/threejs/examples/js/postprocessing/TexturePass.js'></script>
	<script type='text/javascript' src='/game/js/lib/threejs/examples/js/ShaderExtras.js'></script>
    <script type='text/javascript' src='/game/js/lib/Tween.js'></script>

    <script type='text/javascript' src='/game/assets/geometry/Bird.js'></script>

    <script type='text/javascript' src='/game/js/lib/Box2DWeb.js'></script>
    <script type='text/javascript' src='/game/js/lib/EventEmitter.js'></script>

    <script type='text/javascript' src='/game/js/ChuClone/namespace.js'></script>
    <script type='text/javascript' src='/game/js/ChuClone/model/Constants.js'></script>
    <script type='text/javascript' src='/game/js/ChuClone/model/LineSegment.js'></script>
    <script type='text/javascript' src='/game/js/ChuClone/model/AchievementTracker.js'></script>
    <script type='text/javascript' src='/game/js/ChuClone/model/AnalyticsTracker.js'></script>

    <script type='text/javascript' src='/game/js/ChuClone/controller/AudioController.js'></script>

    <script type='text/javascript' src='/game/js/ChuClone/Utils.js'></script>
    <script type='text/javascript' src='/game/js/ChuClone/utils/TextureUtils.js'></script>
    <script type='text/javascript' src='/game/js/ChuClone/utils/StyleMemoizer.js'></script>
    <script type='text/javascript' src='/game/js/ChuClone/utils/FunctionQueue.js'></script>

    <script type='text/javascript' src='/game/js/ChuClone/gui/LevelListing.js'></script>
    <script type='text/javascript' src='/game/js/ChuClone/gui/HUDController.js'></script>
    <script type='text/javascript' src='/game/js/ChuClone/gui/LevelRecap.js'></script>
    <script type='text/javascript' src='/game/js/ChuClone/gui/TutorialNoteDisplay.js'></script>

	<script type='text/javascript' src='/game/js/ChuClone/GameEntity.js'></script>

    <script type='text/javascript' src='/game/js/ChuClone/components/BaseComponent.js'></script>
    <script type='text/javascript' src='/game/js/ChuClone/components/JumpPadComponent.js'></script>
    <script type='text/javascript' src='/game/js/ChuClone/components/FrictionPadComponent.js'></script>
    <script type='text/javascript' src='/game/js/ChuClone/components/MovingPlatformComponent.js'></script>  
    <script type='text/javascript' src='/game/js/ChuClone/components/RespawnPointComponent.js'></script>

    <script type='text/javascript' src='/game/js/ChuClone/components/GoalPadComponent.js'></script>
    <script type='text/javascript' src='/game/js/ChuClone/components/DeathPadComponent.js'></script>
    <script type='text/javascript' src='/game/js/ChuClone/components/AutoRotationComponent.js'></script>
    <script type='text/javascript' src='/game/js/ChuClone/components/TiltComponent.js'></script>

    <script type='text/javascript' src='/game/js/ChuClone/components/effect/ParticleEmitterComponent.js'></script>
    <script type='text/javascript' src='/game/js/ChuClone/components/effect/BirdEmitterComponent.js'></script>
    <script type='text/javascript' src='/game/js/ChuClone/components/effect/MotionStreakComponent.js'></script>

    <script type='text/javascript' src='/game/js/ChuClone/components/player/CharacterControllerComponent.js'></script>
    <script type='text/javascript' src='/game/js/ChuClone/components/player/CheckIsJumpingComponent.js'></script>
    <script type='text/javascript' src='/game/js/ChuClone/components/player/KeyboardInputComponent.js'></script>
    <script type='text/javascript' src='/game/js/ChuClone/components/player/PlayerRecordComponent.js'></script>
    <script type='text/javascript' src='/game/js/ChuClone/components/player/PlayerPlaybackComponent.js'></script>

	<script type='text/javascript' src='/game/js/ChuClone/components/portal/PortalComponent.js'></script>
	<script type='text/javascript' src='/game/js/ChuClone/components/portal/AntiPortalWallComponent.js'></script>
    <script type='text/javascript' src='/game/js/ChuClone/components/portal/PortalGunComponent.js'></script>

    <script type='text/javascript' src='/game/js/ChuClone/components/AntiPhysicsVelocityLimitComponent.js'></script>
    <script type='text/javascript' src='/game/js/ChuClone/components/PhysicsVelocityLimitComponent.js'></script>
    <script type='text/javascript' src='/game/js/ChuClone/components/BoundsYCheckComponent.js'></script>

    <script type='text/javascript' src='/game/js/ChuClone/components/camera/CameraFocusRadiusComponent.js'></script>
    <script type='text/javascript' src='/game/js/ChuClone/components/camera/CameraFollowEditorComponent.js'></script>
    <script type='text/javascript' src='/game/js/ChuClone/components/camera/CameraFollowPlayerComponent.js'></script>
    <script type='text/javascript' src='/game/js/ChuClone/components/camera/CameraOrbitRadiusComponent.js'></script>

    <script type='text/javascript' src='/game/js/ChuClone/components/misc/TutorialNoteComponent.js'></script>

    <script type='text/javascript' src='/game/js/ChuClone/components/ComponentFactory.js'></script>

    <script type='text/javascript' src='/game/js/ChuClone/model/FSM/State.js'></script>
    <script type='text/javascript' src='/game/js/ChuClone/model/FSM/StateMachine.js'></script>

    <script type='text/javascript' src='/game/js/ChuClone/Dispatcher.js'></script>

    <script type='text/javascript' src='/game/js/ChuClone/editor/LevelModel.js'></script>
    <script type='text/javascript' src='/game/js/ChuClone/editor/LevelManager.js'></script>
    <script type='text/javascript' src='/game/js/ChuClone/editor/CameraGUI.js'></script>
    <script type='text/javascript' src='/game/js/ChuClone/editor/PlayerGUI.js'></script>
    <script type='text/javascript' src='/game/js/ChuClone/editor/ShiftDragHelper.js'></script>
    <script type='text/javascript' src='/game/js/ChuClone/editor/WorldEditor.js'></script>
    <script type='text/javascript' src='/game/js/ChuClone/editor/ComponentGUI.js'></script>

    <script type='text/javascript' src='/game/js/ChuClone/physics/ContactListener.js'></script>
    <script type='text/javascript' src='/game/js/ChuClone/physics/DestructionListener.js'></script>
    <script type='text/javascript' src='/game/js/ChuClone/physics/WorldController.js'></script>

    <script type='text/javascript' src='/game/js/ChuClone/GameViewController.js'></script>


    <script type='text/javascript' src='/game/js/ChuClone/states/ChuCloneBaseState.js'></script>
    <script type='text/javascript' src='/game/js/ChuClone/states/EditState.js'></script>
    <script type='text/javascript' src='/game/js/ChuClone/states/EndLevelState.js'></script>
    <script type='text/javascript' src='/game/js/ChuClone/states/PlayLevelState.js'></script>
    <script type='text/javascript' src='/game/js/ChuClone/states/TitleScreenState.js'></script>
    <script type='text/javascript' src='/game/js/ChuClone/ChuCloneGame.js'></script>
eos

importsString = importsString.gsub("<script type='text/javascript' src='/game/", " --js ./")
importsString = importsString.gsub("'></script>", "")
importsString = importsString.gsub("\n", "")
importsString = importsString.gsub("\t", "")
#puts importsString
exec importsString