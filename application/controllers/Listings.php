<?php

class Listings extends CI_Controller
{
    public function index()
    {
        $data['title'] = ucfirst('Listings');
        $data['listings'] = $this->Listings_model->get_listings();
        // var_dump($data['listings']);
        $this->load->view('components/header', $data);
        $this->load->view('listings/index', $data);
        $this->load->view('components/footer');

    }
}
