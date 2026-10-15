package com.arenahub.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="configurazione")
public class Configurazione {

    @Id
    private String chiave;

    private String valore;

    @Column(name="data_modifica")
    private LocalDateTime dataModifica;

    public Configurazione(){}

    public String getChiave(){
        return this.chiave;
    }

    public void setChiave(String chiave) {
        this.chiave = chiave;
    }

    public String getValore() {
        return valore;
    }

    public void setValore(String valore) {
        this.valore = valore;
    }

    public LocalDateTime getDataModifica() {
        return dataModifica;
    }

    public void setDataModifica(LocalDateTime dataModifica) {
        this.dataModifica = dataModifica;
    }
}