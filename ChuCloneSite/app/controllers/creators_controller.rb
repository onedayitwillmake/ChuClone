class CreatorsController < ApplicationController
  # GET /creators
  # GET /creators.xml
  def index
    @creators = Creator.all

    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @creators }
    end
  end

  # GET /creators/1
  # GET /creators/1.xml
  def show
    @creator = Creator.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.xml  { render :xml => @creator }
    end
  end

  # GET /creators/new
  # GET /creators/new.xml
  def new
    @creator = Creator.new

    respond_to do |format|
      format.html # new.html.erb
      format.xml  { render :xml => @creator }
    end
  end

  # GET /creators/1/edit
  def edit
    @creator = Creator.find(params[:id])
  end

  # POST /creators
  # POST /creators.xml
  def create
    @creator = Creator.new(params[:creator])

    respond_to do |format|
      if @creator.save
        format.html { redirect_to(@creator, :notice => 'Creator was successfully created.') }
        format.xml  { render :xml => @creator, :status => :created, :location => @creator }
      else
        format.html { render :action => "new" }
        format.xml  { render :xml => @creator.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /creators/1
  # PUT /creators/1.xml
  def update
    @creator = Creator.find(params[:id])

    respond_to do |format|
      if @creator.update_attributes(params[:creator])
        format.html { redirect_to(@creator, :notice => 'Creator was successfully updated.') }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @creator.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /creators/1
  # DELETE /creators/1.xml
  def destroy
    @creator = Creator.find(params[:id])
    @creator.destroy

    respond_to do |format|
      format.html { redirect_to(creators_url) }
      format.xml  { head :ok }
    end
  end
end
