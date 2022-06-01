<?php

class Pages extends CI_Controller
{
    public function view($page = 'home', $id = null)
    {
        if (!file_exists(APPPATH . 'views/' . $page . '.php')) {
            show_404();
        }


        if ($page == 'home') {
            $data['data'] = $this->Listings_model->getListings();
        }
        if ($id != null) {
            $data['data'] = $this->Listings_model->getListingById($id);
        }

        $data['title'] = ucfirst($page);
        $this->load->view('components/header', $data);
        $this->load->view($page, $data);
        $this->load->view('components/footer');
    }
}
