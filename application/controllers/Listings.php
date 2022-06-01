<?php

class Listings extends CI_Controller
{
    public function index($city)
    {
        
        $locations = $this->Listings_model->searchListingsByCity($city);
        $data = $this->Listings_model->getListings($locations->data[0]->id); # By location ID
        echo json_encode($data);
    }
}
