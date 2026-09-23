-- Execute uma vez no banco utilizado pela API, pela aba SQL do phpMyAdmin.
-- A chave antiga identifica apenas a rotina e a atividade.
-- A nova chave permite repetir a atividade quando o início ou o fim for diferente.
-- Os horários existentes devem estar preenchidos (não podem ser NULL).
-- O índice auxiliar mantém suporte à chave estrangeira de idAtividades,
-- inclusive se a chave primária antiga começava por essa coluna.

ALTER TABLE rotina_tem_atividades
    ADD INDEX idx_rta_atividade_rotina (idAtividades, idRotina),
    DROP PRIMARY KEY,
    ADD PRIMARY KEY (idRotina, idAtividades, horas_iniciais, horas_finais);
