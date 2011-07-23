class HomeController < ApplicationController
  def index
    flash[:notice] = 'Flash:Notice - worked'
  end

end
