require 'test_helper'

class LevelsControllerTest < ActionController::TestCase
  test "should get scrub" do
    get :scrub
    assert_response :success
  end

end
